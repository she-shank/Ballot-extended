var MockBallot = artifacts.require('MockBallot');
var MockBallotInstance;

contract('Mockballot', function(accounts) {
    it("should test contract deployment", async () => {
        MockBallotInstance = await MockBallot.deployed();
        assert(MockBallotInstance != undefined, "Contract deployment failed");
    })

    it("should test test function", async () => {
        let temptime;
        await MockBallotInstance.test();
        temptime = await MockBallotInstance.timee();
        var tt = web3.utils.BN;
        console.log(tt(temptime).toString());
    })

    it("should test the onlyChairperson modifier", function(){
        return MockBallotInstance.registration(accounts[3],{from:accounts[1]}).then(function(){
            //control will come in this block only if the transaction from a account other than the 
            //chairpeson was successful, so we throw a exception , then catch and assert accordingly
            throw("failed access restriction by onlyChairperson Modifier");
       53 }).catch(function(e){
            if(e == "failed access restriction by onlyChairperson Modifier"){
                assert(false);
            } else {
                assert(true);
            }
        })
    });

    it("should reverse time", async () => {
        await MockBallotInstance.turnBackTime(1488994);
        console.log("asdf");
        var t = await MockBallotInstance.regPhaseStart.call();
        console.log("ujm ");
        console.log(t);

        //assert(t == (1627878000-1488994), "registration phase start time must be reduced");
    });
});