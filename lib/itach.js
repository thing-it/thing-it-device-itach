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
                configuration: [{id: "host", label: "Host", type: {id: "string"}}]
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
        this.bindCommands(commands);

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
                    // TODO State logic needs to go here - need event definitions

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
    ITach.prototype.bindCommands = function (commands) {
        for (var command in commands) {
            this[command] = new Function("scope",
                "return this.submitCommand(commands['" + command + "']);");
        }
    };

    /**
     *
     */
    ITach.prototype.submitCommand = function (command) {
        var deferred = q.defer();

        if (this.isSimulated()) {
            this.logInfo("Submitting command '" + command + "'.");
        }
        else {
            this.remote.send(command, function callback(error) {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve();
                }
            });
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

