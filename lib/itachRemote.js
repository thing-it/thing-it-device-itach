module.exports = {
    create: function (configuration) {
        return new ItachRemote().initialize(configuration);
    }
};

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
function ItachRemote() {
    /**
     *
     * @param config
     * @returns {ItachRemote}
     */
    ItachRemote.prototype.initialize = function (config) {
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
    ItachRemote.prototype.learn = function (done) {
        console.log("Kick off learn");
        // this.socket.write("get_IRL\r\n");
    };

    /**
     *
     */
    ItachRemote.prototype.sendNext = function () {
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
    ItachRemote.prototype.send = function (input, done) {
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
    ItachRemote.prototype.stop = function (input, done) {
        if (this.socket) {
            this.socket.destroy();
        }
    };
}
