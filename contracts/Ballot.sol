pragma solidity >=0.7.0 <0.9.0;

contract Ballot {

    struct Voter {
        uint weight;
        bool isVoted;
        address delegate; 
        uint vote;  
    }

    struct Proposal {
        bytes32 name;
        uint voteCount; 
    }

    modifier onlyChairperson {
        require(msg.sender == chairperson, "Only chairperson can give right to vote.");
        _;
    }

    address public chairperson;
    mapping(address => Voter) public votersRecord;
    Proposal[] public proposals;
    string test = "amogus";
    

    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        votersRecord[chairperson].weight = 1;
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function testingTheTest() public view onlyChairperson returns(string memory){
        return test;
    }

    function Registration(address voter) public {
        require(msg.sender == chairperson);
        require(!votersRecord[voter].isVoted);
        require(votersRecord[voter].weight == 0);
        votersRecord[voter].weight = 1;
    }


    function delegate(address to) public {
        Voter storage sender = votersRecord[msg.sender];
        require(!sender.isVoted);
        require(to != msg.sender);

        while (votersRecord[to].delegate != address(0)) {
            to = votersRecord[to].delegate;
            require(to != msg.sender);
        }

        sender.isVoted = true;
        sender.delegate = to;
        Voter storage delegate_ = votersRecord[to];
        if (delegate_.isVoted) {
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            delegate_.weight += sender.weight;
        }
    }

    function vote(uint proposal) public {
        Voter storage sender = votersRecord[msg.sender];
        require(sender.weight != 0);
        require(!sender.isVoted);
        sender.isVoted = true;
        sender.vote = proposal;
        
        proposals[proposal].voteCount += sender.weight;
    }

    function winningProposal() private view returns (uint winningProposal_){
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() public view returns (bytes32 winnerName_){
        winnerName_ = proposals[winningProposal()].name;
    }
}