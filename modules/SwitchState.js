
"use strict";

var EventEmitter = require('events').EventEmitter;
var config = require('../config');

class SwitchState extends EventEmitter {

    constructor (switchCount) {
        super();

        var self = this;
        this.count = switchCount;
        this.switches = {};

        for (var i = 1;i <= switchCount;i++) {
            this.switches[i] = {
                state: false
            }
        }

        this.on('switchChanged', function (nr, state) {
            if (state === true) {
                self.switches[nr].pressStarted = Date.now();
            } else if (state === false) {
                self.emit('switchPressed', parseInt(nr), Date.now() - self.switches[nr].pressStarted);
            }
        })
    }

    load (numericState) {
        var self = this;

        //console.log('Numeric switch state', numericState.toString(2));

        //console.log('sstate', (numericState).toString(2));

        Object.keys(this.switches).forEach(function(switchNr) {
            let switchState = numericState & (1 << switchNr - 1) ? false : true;
            if (switchState != self.switches[switchNr].state) {
                self.deBounce(switchNr, switchState);
            }
            self.switches[switchNr].state = switchState;
        });

    }

    deBounce (switchNr, switchState) {
        var self = this;

        if (this.switches[switchNr].deBouncing) {
            return;
        }

        this.switches[switchNr].deBouncing = true;
        setTimeout(function () {
            self.switches[switchNr].deBouncing = false;
            if (self.switches[switchNr].state === switchState) {
                self.emit('switchChanged', parseInt(switchNr), switchState);
            }
        }, config.switchDeBounceTime);
    }

    getSwitchState (switchNr) {
        "use strict";
        if (this.switches[switchNr].state === undefined) {
            throw(Error(`Can not read Switch nr ${switchNr} on. Relay number out of bounds.`));
        }
        return this.switches[switchNr].state;
    }
}

module.exports = SwitchState;
