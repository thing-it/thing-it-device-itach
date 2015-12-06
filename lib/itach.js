module.exports = {
    createExports: function (metadata, commands) {
        return {
            metadata: {
                family: metadata.family,
                plugin: metadata.plugin,
                label: metadata.label,
                tangible: true,
                actorTypes: [],
                sensorTypes: [],
                services: createServices(commands),
                events: createEvents(commands),
                configuration: [{id: "host", label: "Host", type: {id: "string"}}, {
                    id: "module",
                    label: "Module",
                    type: {id: "integer"},
                    defaultValue: 1
                }, {
                    id: "connector",
                    label: "Connector",
                    type: {id: "integer"},
                    defaultValue: 1
                }]
            },
            create: function () {
                return new ITach().initialize(commands);
            }
        }
    }
};

var q = require('q');
var iTach;

function ITach() {
    /**
     *
     */
    ITach.prototype.initialize = function (commands) {
        for (var command in commands) {
            this[command] = new Function("parameters",
                "return this.submitCommand('" + commands[command] + "');");
        }

        return this;
    };

    /**
     *
     */
    ITach.prototype.start = function () {
        var deferred = q.defer();

        this.state = {lastCode: null};

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

                    for (var id in this.commands) {
                        if (code === this.commands[id]) {
                            this.publishEvent(this.commands[id]);

                            break;
                        }
                    }

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
    ITach.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    ITach.prototype.setState = function () {
    };

    /**
     *
     */
    ITach.prototype.submitCommand = function (command) {
        var deferred = q.defer();

        var irCommand = "sendir," + this.configuration.module + ":" + this.configuration.connector + "," + command;

        this.logInfo("Submitting command '" + irCommand + "'.");

        if (this.isSimulated()) {
        }
        else {
            this.remote.send({"ir": "" + command}, function (error) {
                if (error) {
                    this.logError(error);
                    deferred.reject(error);
                } else {
                    deferred.resolve();
                }
            }.bind(this));
        }

        return deferred.promise;
    };
}

/**
 *
 */
function createServices(commands) {
    var services = [];

    for (var command in commands) {
        services.push({id: command, label: command});
    }

    return services;
};

/**
 *
 */
function createEvents(commands) {
    var events = [];

    for (var command in commands) {
        events.push({id: command, label: command});
    }

    return events;
};