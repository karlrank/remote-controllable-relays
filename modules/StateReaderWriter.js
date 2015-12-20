
"use strict";

var EventEmitter = require('events').EventEmitter;

var gpio = require('rpi-gpio');
var SPI = require('pi-spi');

var util = require('../util/util');


function writePin (pinNr, value) {
    return new Promise(function (resolve, reject) {
        gpio.write(pinNr, value, function (error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}


function transfer (spi, data) {
    return new Promise(function (resolve, reject) {
        spi.transfer(data, data.length, function (error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}


class StateReaderWriter extends EventEmitter {

    constructor (relayState, switchState, IOOptions) {
        super();
        var self = this;
        this.relayState = relayState;
        this.switchState = switchState;
        this.statusLed = false;

        this.IOOptions = IOOptions;
        this.spi = SPI.initialize(IOOptions.SPIPort);
        Promise.all([
            StateReaderWriter.setupPin(IOOptions.relayLatchPin),
            StateReaderWriter.setupPin(IOOptions.switchPLPin),
            StateReaderWriter.setupPin(IOOptions.switchCEPin),
            StateReaderWriter.setupPin(IOOptions.switchOEPin),
            StateReaderWriter.setupPin(IOOptions.statusLEDPin)
        ]).then(function () {
            // Write a zero buffer so that the shift arrays would be initialized into a known safe state
            var zeroBuffer = new Buffer(Math.ceil(Math.max(self.relayState.count, self.switchState.count) / 8));
            for (var i = 0; i < zeroBuffer.length; i++) {
                zeroBuffer.writeInt8(0, i);
            }
            return transfer(self.spi, zeroBuffer);
        }).then(function () {
            self.ready = true;
            self.emit('ready');
        }).catch(function (error) {
            console.error('Error occurred when setting up pins:', error);
            console.error('Stack:', error.stack);
        });
    }

    static setupPin (pinNr) {
        return new Promise(function(resolve, reject) {
            gpio.setup(pinNr, gpio.DIR_OUT, function (error) {
                if (error) {
                    console.error(`Error setting up pin nr: ${pinNr}`, error);
                    reject();
                    return;
                }
                resolve();
            });
        });
    }

    statusLEDOn () {
        this.statusLed = true;
        return writePin(this.IOOptions.statusLEDPin, true);
    }

    statusLEDOff () {
        this.statusLed = false;
        return writePin(this.IOOptions.statusLEDPin, false);
    }

    startBlinkingStatusLed () {
        this.statusLEDBlinking = true;
        this._blinkStatusLED();
    }

    stopBlinkingStatusLed () {
        this.statusLEDBlinking = false;
    }

    _blinkStatusLED () {
        var self = this;
        if (this.statusLEDBlinking) {
            if (this.statusLed) {
                this.statusLEDOff().then(function () {
                    return util.sleep(250);
                }).then(function () {
                    self._blinkStatusLED();
                });
            } else {
                this.statusLEDOn().then(function () {
                    return util.sleep(250);
                }).then(function () {
                    self._blinkStatusLED();
                });
            }
        } else {
            this.statusLEDOn();
        }
    }

    _sync () {
        var self = this;
        return new Promise(function (resolve, reject) {
            var start = Date.now();
            var numericRelayState = self.relayState.toNumeric();
            var relayData = new Buffer(Math.ceil(Math.max(self.relayState.count, self.switchState.count) / 8));
            for (var i = relayData.length - 1;i >= 0;i--) {
                relayData.writeUInt8((numericRelayState >> 8 * i) & 255, i);
            }

            Promise.resolve().then(function () {
                return writePin(self.IOOptions.switchPLPin, false)
            }).then(function () {
                return writePin(self.IOOptions.switchPLPin, true);
            }).then(function () {
                return writePin(self.IOOptions.switchCEPin, false);
            }).then(function () {
                return transfer(self.spi, relayData);
            }).then(function (data) {
                writePin(self.IOOptions.switchCEPin, true);
                self.switchState.loadNumeric(data.readUInt8(0));
                return writePin(self.IOOptions.relayLatchPin, true);
            }).then(function () {
                return writePin(self.IOOptions.relayLatchPin, false);
            }).then(function () {
                //console.log(`Sent the data in ${Date.now() - start}ms`);
                resolve();
            }).catch(function (error) {
                console.error('Error', error);
                console.error('Stack', error.stack);
            });
        });
    }

    sync () {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (self.ready) {
                self._sync().then(resolve, reject);
            } else {
                self.removeAllListeners('ready');
                self.on('ready', function () {
                    self.sync().then(resolve, reject);
                })
            }
        });
    }
}

module.exports = StateReaderWriter;
