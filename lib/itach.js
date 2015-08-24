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

        if (this.isSimulated()) {
            deferred.resolve();
        } else {
            if (!iTach) {
                iTach = require("node-itach");
            }

            this.remote = new iTach({host: this.configuration.host});

            deferred.resolve();
        }

        return deferred.promise;
    };

    /**
     *
     */
    ITach.prototype.getState = function () {
        return {};
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
            this[command] = function () {
                return this.submitCommand(commands[command]);
            };
        }
    };

    /**
     *
     */
    ITach.prototype.submitCommand = function (command) {
        var deferred = q.defer();

        if (this.isSimulated()) {

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

