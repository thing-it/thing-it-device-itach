module.exports = {
	metadata : {
		family : "microcontroller",
		plugin : "microcontroller",
		virtual : true,
		dataTypes : {
			digitalInOutPin : {
				family : "enumeration",
				values : []
			},
			analogInPin : {
				family : "enumeration",
				values : []
			}
		},
		actorTypes : [],
		sensorTypes : [],
		configuration : []
	},
	create : function(device) {
		return new MicroController();
	}
};

var utils = require("../../utils");
var q = require('q');

function MicroController() {
}
