
"use strict";

var config = require('../config');

var RelayState = require('../modules/RelayState');
var SwitchState = require('../modules/SwitchState');
var StateReaderWriter = require('../modules/StateReaderWriter');

var relayState = new RelayState(14);
var switchState = new SwitchState(8);

var stateReaderWriter = new StateReaderWriter(relayState, switchState, {
    SPIPort: config.SPIPort,
    relayLatchPin: config.relayLatchPin,
    switchPLPin: config.switchPLPin,
    switchCEPin: config.switchCEPin,
    switchOEPin: config.switchOEPin
});


switchState.on('switchChanged', function (switchNr, switchState) {
    console.log('Event switchChanged triggered', switchNr, switchState);
    try {
        if (switchState) {
            relayState.relayOn(switchNr);
        } else {
            relayState.relayOff(switchNr);
        }
    } catch (e) {
        console.error('Error', e);
    }
});

//setInterval(function () {
//    stateReaderWriter.sync();
//}, 100);


function sync() {
    stateReaderWriter.sync().then(function () {
        setTimeout(sync, 5);
    });
}

sync();
