pragma solidity >=0.7.0 <0.9.0;


//
//
//
//

contract Ballot {
    
    //set regPhasestart when you want registration phase to start
    //currently set to 2/8/21, 0420 gmt 
    uint regPhaseStart = 1627878000;

    //time window in which the phase state vaiable must be 
    //successfully changed to nexxt phase
    uint constant phaseWindow = 360;

    uint[3] phaseTime = [0, 1 days, 2 days];
   
    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        uint vote;   // index of the voted proposal
    }

    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }
    
    enum Phase {init, reg, vote, res}
    
    modifier onlyChairperson {
        require(msg.sender == chairperson, "Only chairperson can give right to vote.");
        _;
    }
    
    modifier validPhase (Phase _phase) {
        require(currentPhase == _phase, "Required Phase not Active");
        _;
    }

    address public chairperson;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    Phase public currentPhase = Phase.init;

    
    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        currentPhase = Phase.init;

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }
    
    
    function changePhase(uint8 _phase) public {
        if(block.timestamp >= regPhaseStart + phaseTime[_phase-1] && block.timestamp < regPhaseStart + phaseTime[_phase-1]+phaseWindow){
            currentPhase = Phase(_phase);
        }    
    }
    
    
    function registration(address voter) public onlyChairperson validPhase(Phase.reg){
        require(
            !voters[voter].voted,
            "The voter already voted."
        );
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
    }

    
    function delegate(address to) public validPhase(Phase.vote){
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
            require(to != msg.sender, "Found loop in delegation.");
        }
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            delegate_.weight += sender.weight;
        }
    }

    
    function vote(uint proposal) public validPhase(Phase.vote){
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;

        proposals[proposal].voteCount += sender.weight;
    }

    
    function winningProposal() private view 
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

 
    function winnerName() public view validPhase(Phase.res)
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}
