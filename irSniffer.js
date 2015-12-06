module.exports = {
    metadata: {
        family: "irSniffer",
        plugin: "irSniffer",
        label: "IR Sniffer",
        tangible: true,
        discoverable: true,
        actorTypes: [],
        sensorTypes: [],
        services: [{id: "clear", label: "Clear"}],
        configuration: [{id: "host", label: "Host", type: {id: "string"}}]
    },
    create: function (commands) {
        return new IrSniffer();
    },
    discovery: function () {
        return new IrSnifferDiscovery();
    }
};

var q = require("q");
var itachRemote;
var dgram;

/**
 *
 * @constructor
 */
function IrSnifferDiscovery() {
    /**
     *
     * @param options
     */
    IrSnifferDiscovery.prototype.start = function () {
        if (this.node.isSimulated()) {
            this.timer = setInterval(function () {
                var irSniffer = new IrSniffer();

                irSniffer.configuration = this.defaultConfiguration;
                irSniffer.configuration.host = "test";
                irSniffer.configuration.label = "Test IR Sniffer";

                this.advertiseDevice(irSniffer);
            }.bind(this), 20000);
        } else {
            if (!dgram) {
                dgram = require("dgram");
            }

            // TODO For now, need to be able to switch for Discovery or inherit from Device

            this.logLevel = "debug";

            // Protocol details under http://www.globalcache.com/files/releases/flex-16/API-Flex_TCP_1.6.pdf

            this.socket = dgram.createSocket('udp4');

            this.socket.bind(9131, function () {
                this.socket.addMembership("239.255.250.250");

                this.socket.on('message', function (msg) {
                    var content = msg.toString("utf-8");

                    // Beacon is AMXB<-prop1=val1><-...>

                    if (content.indexOf("AMXB") != 0) {
                        this.logError("Wrong beacon: " + content);
                        this.logError(content.indexOf("AMXB"));

                        return;
                    }

                    var data = content.substring(6, content.length - 2).split("><-");
                    var properties = {};

                    for (var n in data) {
                        var pair = data[n].split("=");

                        properties[pair[0]] = pair[1];
                    }

                    this.logDebug(properties);

                    var irSniffer = new IrSniffer();

                    irSniffer.configuration = this.defaultConfiguration;
                    irSniffer.configuration.uuid = properties["UUID"];
                    irSniffer.configuration.label = properties["UUID"];
                    irSniffer.configuration.host = properties["Config-URL"].substring(7); // Starts with http://

                    this.advertiseDevice(irSniffer);
                }.bind(this));
            }.bind(this));
        }
    };

    /**
     *
     * @param options
     */
    IrSnifferDiscovery.prototype.stop = function () {
        if (this.node.isSimulated()) {
        } else {
            if (this.socket) {
                this.socket.close();
            }
        }
    };
}

function IrSniffer() {
    /**
     *
     */
    IrSniffer.prototype.start = function () {
        this.class = "IrSniffer";
        this.state = {lastCode: null};

        var deferred = q.defer();

        if (this.isSimulated()) {
            deferred.resolve();
        } else {
            if (!itachRemote) {
                itachRemote = require("./lib/itachRemote");
            }

            this.remote = itachRemote.create({host: this.configuration.host});
            this.remote.learn(function done(error, code) {
                this.logDebug("Receiving code: " + code);

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
    IrSniffer.prototype.stop = function () {
    };

    /**
     *
     */
    IrSniffer.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    IrSniffer.prototype.setState = function () {
    };

    /**
     *
     */
    IrSniffer.prototype.clear = function () {
        this.state.lastCode = null;

        this.publishStateChange();
    };
}