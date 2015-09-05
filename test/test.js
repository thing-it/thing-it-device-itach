var TVRemote = require('../tvRemote');

var tvRemote = TVRemote.create({});

tvRemote.isSimulated = function () {
    return false;
};
tvRemote.configuration = {
    host: "10.0.1.28"
};
tvRemote.publishEvent = function(event, data){
    console.log("Event", event);
};
tvRemote.publishStateChange = function(){
    console.log("State Change", this.getState());
};

tvRemote.logInfo = function(){
    if (arguments.length == 1 ) {
        console.log(arguments[0]);
    }
    else{
        console.log(arguments);
    }
}
tvRemote.logDebug = function(){
    tvRemote.logInfo(arguments);
}
tvRemote.logError = function(){
    tvRemote.logInfo(arguments);
}

console.log("About to start");

tvRemote.start();
