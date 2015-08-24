module.exports = {
    label: "IR Sniffing",
    id: "irSniffing",
    devices: [{
        label: "IR Sniffer",
        id: "irSniffer",
        plugin: "itach/irSniffer",
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
