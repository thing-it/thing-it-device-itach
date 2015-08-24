module.exports = {
    label: "Home",
    id: "home",
    devices: [{
        label: "TV",
        id: "tv",
        plugin: "itach/tvRemote",
        configuration: {
            simulated: true,
            host: "192.168.10.1"
        },
        actors: [],
        sensors: []
    }, {
        label: "iRobot Roomba",
        id: "iRobotRoomba",
        plugin: "itach/iRobotRoombaRemote",
        configuration: {
            simulated: true,
            host: "192.168.10.1"
        },
        actors: [],
        sensors: []
    }],
    services: [],
    eventProcessors: []
};
