module.exports = require("./lib/itach").createExports({
    family: "iRobotRoombaRemote", plugin: "iRobotRoombaRemote",
    label: "iRobot Roomba Remote"
}, {
    "go": "sendir,1:1,1,37735,1,1,171,171,21,64BB,21,21CCCCBBBCCCCCCBCCCCCCBCBBBBBB,21,3773",
    "stop": "sendir,1:1,1,40453,1,1,189,4,4,317,22,63,22,21CD,20,23,13,72,18,25,12,73,19,24,9,4,4,73,14,28,8,77,10,75,11,32,6,79,13,30,9,76,16,69,20,22,13,72,19,24,12,31,8,35,8,35,9,34,10,33,11,73DCCCC,22,1086,214,294CDCD,13,30,8,77,11,32,4,81,5,123,4,4010",
    "dock": "sendir,1:1,1,40453,1,1,342,170,22,63,22,21BCCBCBCBCBBCBCCBCBCCCCBCBCBBBB,22,1086ABCBCCBCBCB,21,22,12,73,15,70,12,31,5,80,7,36,4,127,4,2002,10,4010",
});

