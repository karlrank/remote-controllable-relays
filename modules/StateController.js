
"use strict";

var fs = require('fs');

var _ = require('lodash');

var config = require('../config');
var util = require('../util/util');

class StateController  {

    constructor (stateReaderWriter) {
        var self = this;
        this.stateReaderWriter = stateReaderWriter;
        this.relayState = stateReaderWriter.relayState;
        this.switchState = stateReaderWriter.switchState;

        this.playbooks = JSON.parse(fs.readFileSync('playbooks.json').toString());
        this.triggers = JSON.parse(fs.readFileSync('triggers.json').toString());

        this.playbooks = _.mapValues(this.playbooks, function (playbook) {
            playbook.relaysUsed = _.reduce(playbook.relaysUsed, function (result, relayNr, i) {
                result[relayNr] = true;
                return result;
            }, {});
            return playbook;
        });
    }

    bind (data) {
        var self = this;
        switch (data.mode) {
            case 'press':
                this.switchState.on('switchPressed', function (switchNr, timePressed) {
                    if (data.switch === switchNr && (data.modeArgument == undefined || timePressed > data.modeArgument)) {
                        for (var i = 0; i < data.actions.length; i++) {
                            var action = data.actions[i],
                                _break = false;

                            switch (action.condition.key) {
                                case 'relayState':
                                    if (action.condition.keyArgument === undefined) {
                                        throw Error(`Missing action.condition.keyArgument on trigger: ${JSON.stringify(data, null, 4)}`);
                                    }
                                    if (action.condition.keyArgument === undefined) {
                                        throw Error(`Missing action.condition.value on trigger: ${JSON.stringify(data, null, 4)}`);
                                    }
                                    if (self.relayState.getRelayState(action.condition.keyArgument) === action.condition.value) {
                                        self.runPlaybook(action.action);
                                        _break = true;
                                    }
                                    break;
                            }
                            if (_break) {
                                break;
                            }
                        }
                    }
                });
                break;
            case 'change':
                // TODO: If necessary develop the rest of the options here!
                break;
        }
    }

    runPlaybook (playbookName) {
        var self = this;
        var playbook = this.playbooks[playbookName];
        if (playbook === undefined) {
            throw Error(`Playbook "${playbookName}" not found.`);
        }

        // If playbook is already running, don't start again
        if (playbook.next !== undefined) {
            return;
        }

        // Stop all other playbooks that use overlapping relays
        Object.keys(playbook.relaysUsed).forEach(function (usedRelay) {
            Object.keys(self.playbooks).forEach(function (playbookName) {
                if (self.playbooks[playbookName].relaysUsed[usedRelay]) {
                    self.playbooks[playbookName].next = undefined;
                }
            });
        });

        playbook.next = 0;
        this._runPlaybook(playbook);
    }

    _doPlaybookStep (step) {
        var self = this;
        return new Promise(function (resolve, reject) {
            switch (step.action) {
                case "relayOn":
                    self.relayState.relayOn(step.argument);
                    resolve();
                    break;
                case "relayOff":
                    self.relayState.relayOff(step.argument);
                    resolve();
                    break;
                case "sleep":
                    util.sleep(step.argument).then(resolve, reject);
                    break;
                default:
                    reject();
                    break;

            }
        });
    }

    _runPlaybook (playbook) {
        var self = this;
        if (playbook.next !== undefined) {
            this._doPlaybookStep(playbook.steps[playbook.next]).then(function () {
                if (playbook.next !== undefined) {
                    playbook.next++;
                    if (playbook.next < playbook.steps.length) {
                        self._runPlaybook(playbook);
                    } else {
                        playbook.next = undefined;
                    }
                }
            }).catch(function (error) {
                console.log('Error executing playbook step', error, playbook);
            })
        }
    }

    sync () {
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

        for (var i = 0; i < this.triggers.length; i++) {
            var trigger = this.triggers[i];
            this.bind(trigger);
        }
    }
}

module.exports = StateController;
