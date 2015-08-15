module.exports = {
    createMetadata: function (metadata, commands) {
        return {
            family: metadata.family,
            plugin: metadata.plugin,
            label: metadata.label,
            actorTypes: [],
            sensorTypes: [],
            services: createServices(commands),
            configuration: [{id: "host", label: "Host", type: {id: "string"}}]
        }
    },
    create: function (commands) {
        return new ITach().initialize(commands);
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
    ITach.prototype.bindCommands = function (prototype, commands) {
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

        remote.send(command, function callback(error) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve();
            }
        });

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
