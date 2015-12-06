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
var net = require('net');

var ERRORCODES = {
    '001': 'Invalid command. Command not found.',
    '002': 'Invalid module address (does not exist).',
    '003': 'Invalid connector address (does not exist).',
    '004': 'Invalid ID value.',
    '005': 'Invalid frequency value.',
    '006': 'Invalid repeat value.',
    '007': 'Invalid offset value.',
    '008': 'Invalid pulse count.',
    '009': 'Invalid pulse data.',
    '010': 'Uneven amount of <on|off> statements.',
    '011': 'No carriage return found.',
    '012': 'Repeat count exceeded.',
    '013': 'IR command sent to input connector.',
    '014': 'Blaster command sent to non-blaster connector.',
    '015': 'No carriage return before buffer full.',
    '016': 'No carriage return.',
    '017': 'Bad command syntax.',
    '018': 'Sensor command sent to non-input connector.',
    '019': 'Repeated IR transmission failure.',
    '020': 'Above designated IR <on|off> pair limit.',
    '021': 'Symbol odd boundary.',
    '022': 'Undefined symbol.',
    '023': 'Unknown option.',
    '024': 'Invalid baud rate setting.',
    '025': 'Invalid flow control setting.',
    '026': 'Invalid parity setting.',
    '027': 'Settings are locked'
};

var DELAY_BETWEEN_COMMANDS = 5000;

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
            this.remote = new Remote().initialize(this.configuration);

            console.log("Start learning");

            this.remote.learn(function (error, code) {
                if (error) {
                    this.logError(error);
                } else {
                    this.logInfo("Code", code);
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
    ITach.prototype.stop = function () {
        return this.remote.stop();
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
            this.remote.send(irCommand, function (error) {
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


// ==============

//var
//    callbacks = {},
//    messageQueue = [],
//    _currentRequestID = 0;
//var _addToCallbacks = function (done, predefinedId) {
//        var id;
//        if (!predefinedId) {
//            console.log('node-itach :: generating new id for IR transmittion');
//            console.log('node-itach :: currently callbacks hash contains %d', Object.keys(callbacks).length);
//            _currentRequestID++;
//            id = _currentRequestID;
//        }
//        else
//            id = predefinedId;
//        callbacks[id] = done;
//        return id;
//    },
//    _resolveCallback = function (id, err) {
//        if (callbacks[id]) {
//            console.log('node-itach :: status:%s resolving callback with id %s', err ? 'error' : 'success', id);
//            callbacks[id](err || false);
//            delete callbacks[id];
//        } else {
//            console.error('node-itach :: cannot find callback with id %s in callbacks hash', id);
//        }
//    };

/**
 *
 * @param config
 * @constructor
 */
function Remote() {
    /**
     *
     * @param config
     * @returns {Remote}
     */
    Remote.prototype.initialize = function (config) {
        this.config = config;
        this.config.port = 4998;
        this.config.timeout = 20000;

        if (!this.config.host) {
            throw new Error('Host is required for this module to function');
        }

        this.isSending = false;
        this.messageQueue = [];

        console.log('Connecting to ' + this.config.host + ':' + this.config.port);

        this.socket = net.connect({port: this.config.port, host: this.config.host}, function () {
            console.log('node-itach :: connected to ' + this.config.host + ':' + this.config.port);

            //socket.setTimeout(this.config.timeout);
        }.bind(this));

        this.socket.on('close', function () {
            console.log('node-itach :: disconnected from ' + config.host + ':' + config.port);
        }.bind(this));

        this.socket.on('error', function (err) {
            console.error('node-itach :: error :: ', err);
        }.bind(this));

        this.socket.on('timeout', function () {
            console.error('node-itach :: error :: ', 'Timeout');
        }.bind(this));

        this.socket.on('data', function (data) {
            data = data.toString().replace(/[\n\r]$/, "");
            console.log("node-itach :: received data: " + data);

            var parts = data.split(','),
                status = parts[1],
                id = parts[2];

            if (status === 'busyIR') {
                // This shound not happen if this script is the only device connected to the itach
                // add rate limiter
                //return _resolveCallback(id, 'Add Rate Limiter to the blaster');
            } else if (status.match(/^ERR/)) {
                var err = ERRORCODES[parts[1].split('IR')[1]];
                console.error('node-itach :: error :: ' + data + ': ' + err);
                // return _resolveCallback(parts[2], err);
            } else if (parts[0] === 'setstate') {
                //_resolveCallback(parts[1]);
            } else if (parts[0] !== 'setstate') {
                //_resolveCallback(id);
            }

            this.isSending = false;

            // go to the next message in the queue if any

            if (this.messageQueue.length) {
                console.log('Delay before going to another item in a queue...');

                // for some reason my samsung tv needs this timeout.

                setTimeout(function () {
                    this.sendNext();
                }.bind(this), DELAY_BETWEEN_COMMANDS);
            }
        }.bind(this));

        return this;
    };

    /**
     *
     * @param done
     */
    Remote.prototype.learn = function (done) {
        console.log("Kick off learn");
        // this.socket.write("get_IRL\r\n");
    };

    /**
     *
     */
    Remote.prototype.sendNext = function () {
        if (!this.messageQueue.length) {
            console.log('Message queue is empty. returning...')
            return;
        }

        this.isSending = true;

        console.log('Taking next message from the queue.')

        var message = this.messageQueue.shift(),
            id = message[0],
            data = message[1];

        console.log('node-itach :: sending data', data);

        this.socket.write(data + "\r\n");
    };

    /**
     *
     * @param input
     * @param done
     */
    Remote.prototype.send = function (input, done) {
        if (!input) throw new Error('Missing input');
        //var data,
        //    ir = (input.ir != null);
        //if (ir)
        //    parts = input.ir.split(',');
        //else
        //    parts = input.serial.split(',');
        //
        //if (ir && typeof input.module !== 'undefined') {
        //    parts[1] = '1:' + input.module;
        //}
        //var id;
        //if (ir) {
        //    id = _addToCallbacks(done);
        //    parts[2] = id;
        //}
        //else {
        //    id = parts[1];
        //    _addToCallbacks(done, id);
        //}
        //
        //if (ir && typeof input.repeat !== 'undefined') {
        //    parts[4] = input.repeat;
        //}

        //data = parts.join(',');

        // add to queue

        this.messageQueue.push([new Date().getTime(), input]);

        // Kick off sending

        if (!this.isSending) {
            this.sendNext();
        }
    };

    /**
     *
     * @param input
     * @param done
     */
    Remote.prototype.stop = function (input, done) {
        if (this.socket) {
            this.socket.destroy();
        }
    };
}
