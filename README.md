# thing-it-device-itach

[![NPM](https://nodei.co/npm/thing-it-device-itach.png)](https://nodei.co/npm/thing-it-device-itach/)
[![NPM](https://nodei.co/npm-dl/thing-it-device-itach.png)](https://nodei.co/npm/thing-it-device-itach/)

[thing-it-node] Device Plugin for [ITach Bridges](http://www.globalcache.com/products/itach/) (e.g. Wifi/Infrared).

<img src="./documentation/images/itach.jpg">

This allows you to 

* control the devices you usually control with your IR remotes devices from a mobile UI over the Internet,
* define complex Services, Event Processing, Storyboards and Jobs combining the IR-controlled devices with other Devices, Sensors and Actors.

by means of [thing-it-node](https://github.com/marcgille/thing-it-node) and [thing-it.com](http://www.thing-it.com).

E.g. you could switch of the TV if the motion detector has not detected any movement in the room for 10 minutes (because you fell asleep) or
start your cleaning robot with a more sophisticated schedule. 

## Installation

After you have 

* [set up](http://www.thing-it.com/thing-it/index.html?document=gettingStarted#/documentationPanel) your [thing-it] Node Box and 
* configured or copied a [thing-it] Mesh with an ITach Bridge, 

connect your ITach Bridge to your [thing-it] Node Box via the appropriate settings for the ITach device (IP-Address) and connect the IR Emitters, e.g.
like

<img src="./documentation/images/itach-setup.jpg">

## User Interface

User Interfaces depend on the remotes you have been using in your [thing-it] Node Mesh/Configuration. E.g. for a [Configuration
with a Samsung TV and iRobot Roomba Cleaning Robot](./examples/samsungAndRoombaConfiguration.js):

<img src="./documentation/images/samsung-and-roomba-ui.jpg">

## Adding your own Remotes

Writing your own Remote Plugins is very easy:

Point [thing-it-node] to the [Sniffer Configuration](./examples/snifferConfiguration.js) or push the corresponding 
Mesh from the [thing-it.com Mesh Market]() to you local Node Box.

Log in to [thing-it-node] locally or via thing-it.com. The UI should show you the Sniffer UI:

<img src="./documentation/images/sniffer-ui.jpg">

Click all relevant buttons on your remote and record the corresponding codes. With these create a file myRemote.js like

```
module.exports = require("./lib/itach").createExports({
    family: "myRemote", plugin: "myRemote",
    label: "My Remote"
}, {
    "button1": code1,
    "button2": code2,
    ...
});
```

and create an **myRemote.html** file under /web, e.g.

```
<table class="formTable">
    <tr>
        <td>
            <div class="circleButton" ng-click="panel.callDeviceService(component, 'button1')">1
            </div>
        </td>
        <td>
            <div class="circleButton" ng-click="panel.callDeviceService(component, 'button2')">2
            </div>
        </td>
    </tr>
</table>

```

You can surely be more cretive with your UI and finally get the remote control layout you always wanted.

