var Ballot = artifacts.require("Ballot");

function string_to_hex(str) {
	var arr1 = [];
	for (var n = 0, l = str.length; n < l; n ++) {
		var hex = Number(str.charCodeAt(n)).toString(16);
		arr1.push(hex);
	}
	return arr1.join('');
}

function string_array_to_bytes32_array(item){
    var temp =  string_to_hex(item).padStart(64, '0');
    return "0x" + temp;
}

module.exports = function(deployer) {
    var proposalNamesRaw = ['Ramesh', 'Mahesh', 'Suresh'];
    //forEach not working
    //also cannot to seem eliminate redundant function 'string_array_to_bytes32_array'
    var proposalNames = proposalNamesRaw.map(string_array_to_bytes32_array);
    deployer.deploy(Ballot,proposalNames);
};