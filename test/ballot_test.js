var Ballot = artifacts.require("Ballot");
var BallotInstance;

function string_to_hex(str) {
	var arr1 = [];
	for (var n = 0, l = str.length; n < l; n ++) {
		var hex = Number(str.charCodeAt(n)).toString(16);
		arr1.push(hex);
	}
	return arr1.join('');
}

contract('Ballot', function(accounts){
    it("Contract Deploymenmt", function(){
        return Ballot.deployed().then(function(instance){
            BallotInstance = instance;
            assert(BallotInstance !== undefined, 'Ballot contract should be defined');
        })
    });

    // it("does it tests the test from the chairperson account", function(){
    //     return BallotInstance.testingTheTest().then(function(test_string) {
    //         assert.equal(test_string, "amogus", "test test failed");
    //     })
    // });

    it("should test the onlyChairperson modifier", function(){
        return BallotInstance.registration(accounts[3],{from:accounts[1]}).then(function(){
            //control will come in this block only if the transaction from a account other than the 
            //chairpeson was successful, so we throw a exception , then catch and assert accordingly
            throw("failed access restriction by onlyChairperson Modifier");
        }).catch(function(e){
            if(e == "failed access restriction by onlyChairperson Modifier"){
                assert(false);
            } else {
                assert(true);
            }
        })
    });

    it("should test account registration", async() => {
        let accountsToBeRegistered = [1,2,3,4,5,6];
        let tempVotersRecord;
        accountsToBeRegistered.forEach(async (value) => {
            await BallotInstance.registration(accounts[value]);
            tempVotersRecord = await BallotInstance.votersRecord(accounts[value]);
            assert(tempVotersRecord.weight == 1, 'account registration unsuccessful' );
        })
    });

    it("should test voting from unregistered account", async() => {
        try{
        await BallotInstance.vote(1,{from:accounts[7]}).then(() => {
            throw("vote successful from unregistered account");
        });
        }catch(error){
            if(error == "vote successful from unregistered account")
                assert(false);
        }
    });

    it("should test voting from single account", async() => {
        let voterRecord;
        let proposal;
        await BallotInstance.vote(2,{from:accounts[1]});
        voterRecord = await BallotInstance.votersRecord(accounts[1]);
        assert(voterRecord.isVoted, 'vote unsuccessful');
        proposal = await BallotInstance.proposals(2);
        assert(proposal.voteCount == 1, 'vote unsuccessful');
    });

    it("should test vote delegation to other voter after the latter voted", async() => {
        let voterRecord;
        let proposal;
        await BallotInstance.delegate(accounts[1],{from:accounts[2]});
        voterRecord = await BallotInstance.votersRecord(accounts[2]);
        assert(voterRecord.isVoted, 'delegation unsuccessful');
        proposal = await BallotInstance.proposals(2);
        assert(proposal.voteCount == 2, 'delegation unsuccessful');
    });

    it("should test vote delegation to other voter before the latter voted", async() => {
        let voterRecord;
        await BallotInstance.delegate(accounts[4],{from:accounts[3]});
        voterRecord = await BallotInstance.votersRecord(accounts[3]);
        assert(voterRecord.isVoted, 'delegation unsuccessful');
        voterRecord = await BallotInstance.votersRecord(accounts[4]);
        assert(voterRecord.weight == 2, 'delegation unsuccessful');
    });

    it("should test voting from already delegated account", async() => {
        try{
            await BallotInstance.vote(1,{from:accounts[3]}).then(() => {
                throw("vote successful from already delegated account");
            });
            }catch(error){
                if(error == "vote successful from already delegated account")
                    assert(false);
            }
    });

    it("should test voting from remaining accounts", async() => {
        // not checking the proposal array value after voting, immediately
        let tempVotersRecord;
        var remainingVoters = [4,5,6];
        remainingVoters.forEach( async (value) => {
            await BallotInstance.vote(value-4,{from:accounts[value]});
            tempVotersRecord = await BallotInstance.votersRecord(accounts[value]);
            assert(tempVotersRecord.isVoted, 'vote unsuccessful');
        })
    });

    it("should test the final result", async() => {
        let winner = "Suresh";
        let winner_hex_i = string_to_hex(winner).padStart(64, '0');
        winner_hex = '0x' + winner_hex_i;
        let winner_bytes32;
        winner_bytes32 = await BallotInstance.winningProposal();
        assert(winner_bytes32 == winner_hex, "Wrong result, vote count unsuccessful");
    });


});