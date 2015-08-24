module.exports = {
    metadata: {
        family: "irSniffer",
        plugin: "irSniffer",
        label: "IR Sniffer",
        tangible: true,
        actorTypes: [],
        sensorTypes: [],
        services: [{id: "clear", label: "Clear"}],
        configuration: [{id: "host", label: "Host", type: {id: "string"}}]
    },
    create: function (commands) {
        return new irSniffer();
    }
};

var q = require("q");
var iTach;

function irSniffer() {
    /**
     *
     */
    irSniffer.prototype.start = function () {
        this.class = "irSniffer";
        this.state = {lastCode: null};

        var deferred = q.defer();

        if (this.isSimulated()) {
            deferred.resolve();
        } else {
            if (!iTach) {
                iTach = require("node-itach");
            }

            this.remote = new iTach({host: this.configuration.host});

            this.remote.learn(function done(error, code) {
                if (error) {
                    this.logError(error);
                } else {
                    this.state.lastCode = code;

                    this.publishStateChange();
                }
            }.bind(this));

            deferred.resolve();
        }

        return deferred.promise;
    };

    /**
     *
     */
    irSniffer.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    irSniffer.prototype.setState = function () {
    };

    /**
     *
     */
    irSniffer.prototype.clear = function () {
        this.state.lastCode = null;

        this.publishStateChange();
    };
}