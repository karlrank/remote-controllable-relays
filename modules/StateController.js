
"use strict";

var config = require('../config');
var util = require('../util/util');

var RelayState = require('./RelayState');
var SwitchState = require('./SwitchState');
var StateReaderWriter = require('./StateReaderWriter');

class StateController  {

    constructor () {
        this.relayState = new RelayState(config.relayCount);
        this.switchState = new SwitchState(config.switchCount);

        this.stateReaderWriter = new StateReaderWriter(this.relayState, this.switchState, {
            SPIPort: config.SPIPort,
            relayLatchPin: config.relayLatchPin,
            switchPLPin: config.switchPLPin,
            switchCEPin: config.switchCEPin,
            switchOEPin: config.switchOEPin
        });
    }

    sync() {
        var self = this;
        this.stateReaderWriter.sync().then(function () {
            setTimeout(function () {
                self.sync();
            }, config.syncInterval);
        });
    }

    run () {
        this.sync()
    }
}

module.exports = StateController;
