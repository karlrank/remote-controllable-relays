
"use strict";

class RelayState {
    constructor (relayCount) {
        this.count = relayCount;
        this.relays = {};
        for (var i = 1;i <= relayCount;i++) {
            this.relays[i] = false;
        }
    }

    relayOn (relayNr) {
        "use strict";
        if (this.relays[relayNr] === undefined) {
            throw(Error(`Can not switch Relay nr ${relayNr} on. Relay number out of bounds.`));
        }
        this.relays[relayNr] = true;
    }

    relayOff (relayNr) {
        "use strict";
        if (this.relays[relayNr] === undefined) {
            throw(Error(`Can not switch Relay nr ${relayNr} off. Relay number out of bounds.`));
        }
        this.relays[relayNr] = false;
    }

    setRelay (relayNr, state) {
        if (this.relays[relayNr] === undefined) {
            throw(Error(`Can not switch Relay nr ${relayNr} off. Relay number out of bounds.`));
        }
        this.relays[relayNr] = state;
    }

    toggleRelay (relayNr) {
        "use strict";
        if (this.relays[relayNr] === undefined) {
            throw(Error(`Can not toggle Relay nr ${relayNr}. Relay number out of bounds.`));
        }
        this.relays[relayNr] = !this.relays[relayNr];
    }

    getRelayState (relayNr) {
        "use strict";
        if (this.relays[relayNr] === undefined) {
            throw(Error(`Can not read Relay nr ${relayNr} on. Relay number out of bounds.`));
        }
        return this.relays[relayNr];
    }

    toNumeric () {
        var self = this;
        var numericState = 0;
        let nrOfBytes = Math.ceil(self.count / 8),
            shift = nrOfBytes * 8 - self.count;

        Object.keys(this.relays).forEach(function(relayNr) {
            numericState += self.relays[relayNr] ? (1 << (self.count - parseInt(relayNr) + shift)) : 0;
        });

        return numericState;
    }

    asArray () {
        var booleanArray = [];
        for (var i = 1;i <= this.count;i++) {
            booleanArray.push({
                nr: i,
                state: this.relays[i]
            });
        }
        return booleanArray;
    }
}

module.exports = RelayState;
