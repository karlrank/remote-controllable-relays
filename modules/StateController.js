
"use strict";

var config = require('../config');

class StateController  {

    constructor (stateReaderWriter) {
        this.stateReaderWriter = stateReaderWriter;
        this.relayState = stateReaderWriter.relayState;
        this.switchState = stateReaderWriter.switchState;
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
        var self = this;
        this.sync();
    }
}

module.exports = StateController;
