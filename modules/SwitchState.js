
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

    loadNumeric (numericState) {
        var stateMap = {};
        Object.keys(this.switches).forEach(function(switchNr) {
            stateMap[switchNr] = numericState & (1 << switchNr - 1) ? false : true;

        });
        this.load(stateMap);
    }

    load (stateMap) {
        var self = this;
        Object.keys(this.switches).forEach(function(switchNr) {
            if (stateMap[switchNr] != self.switches[switchNr].state) {
                self.deBounce(switchNr, stateMap[switchNr]);
            }
            self.switches[switchNr].state = stateMap[switchNr];
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
            throw(Error(`Can not read Switch nr ${switchNr} on. Switch number out of bounds.`));
        }
        return this.switches[switchNr].state;
    }

    asArray () {
        var booleanArray = [];
        for (var i = 1;i <= this.count;i++) {
            booleanArray.push({
                nr: i,
                state: this.switches[i].state
            });
        }
        return booleanArray;
    }
}

module.exports = SwitchState;
