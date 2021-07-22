pragma solidity >=0.7.0 <0.9.0;

import "./Ballot.sol";

contract MockBallot is Ballot{
    
    uint public timee;
    uint public r = 2;

    constructor (bytes32[] memory proposalNames) Ballot(proposalNames){

    }
    
    function test () public {
        timee = block.timestamp;
    }

    function turnBackTime(uint256 secs) external {
        regPhaseStart -= secs;
    }
}