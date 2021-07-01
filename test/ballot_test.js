var Ballot = artifacts.require("Ballot");
var BallotInstance;

contract('Ballot', function(accounts){
    it("Contract Deploymenmt", function(){
        return Ballot.deployed().then(function(instance){
            BallotInstance = instance;
            assert(BallotInstance !== undefined, 'Ballot contract should be defined');
        })
    });

    it("does it tests the test from the chairperson account", function(){
        return BallotInstance.testingTheTest().then(function(test_string) {
            assert.equal(test_string, "amogus", "test test failed");
        })
    });

    it("should test the onlyChairperson modifier", function(){
        return BallotInstance.testingTheTest({from:accounts[1]}).then(function(){
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
});