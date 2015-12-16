
"use strict";

var EventEmitter = require('events').EventEmitter;

var _ = require('lodash');

class StateReaderWriter extends EventEmitter {

    constructor (relayState, switchState, $switchesElement, $relaysElement) {
        super();
        var self = this;
        this.relayState = relayState;
        this.switchState = switchState;

        this.$switchesElement = $switchesElement;
        this.$relaysElement = $relaysElement;

        this.click1 = new Audio('sound/click1.mp3');
        this.click2 = new Audio('sound/click2.mp3');

        self.ready = true;
        self.emit('ready');
    }

    _sync () {
        var self = this;
        return new Promise(function (resolve, reject) {

            self.relayState.asArray().forEach(function (relay) {
                var $relayElement = self.$relaysElement.find(`div.relay[data-nr="${relay.nr}"]`);
                if (relay.state) {
                    if (!$relayElement.hasClass('on')) {
                        self.click1.play();
                    }
                    $relayElement.addClass('on').removeClass('off');
                } else {
                    if (!$relayElement.hasClass('off')) {
                        self.click2.play();
                    }
                    $relayElement.removeClass('on').addClass('off');
                }
            });

            var switchStateMap = {};
            self.$switchesElement.find('div.switch').each(function (index, element) {
                var $element = $(element);
                switchStateMap[$element.data('nr')] = $element.hasClass('on');
            });

            self.switchState.load(switchStateMap);

            resolve();

            //var start = Date.now();
            //var numericRelayState = self.relayState.toNumeric();
            //var relayData = new Buffer(Math.ceil(Math.max(self.relayState.count, self.switchState.count) / 8));
            //for (var i = relayData.length - 1;i >= 0;i--) {
            //    relayData.writeUInt8((numericRelayState >> 8 * i) & 255, i);
            //}
            //
            //Promise.resolve().then(function () {
            //    return writePin(self.IOOptions.switchPLPin, false)
            //}).then(function () {
            //    return writePin(self.IOOptions.switchPLPin, true);
            //}).then(function () {
            //    return writePin(self.IOOptions.switchCEPin, false);
            //}).then(function () {
            //    return transfer(self.spi, relayData);
            //}).then(function (data) {
            //    writePin(self.IOOptions.switchCEPin, true);
            //    self.switchState.load(data.readUInt8(0));
            //    return writePin(self.IOOptions.relayLatchPin, true);
            //}).then(function () {
            //    return writePin(self.IOOptions.relayLatchPin, false);
            //}).then(function () {
            //    //console.log(`Sent the data in ${Date.now() - start}ms`);
            //    resolve();
            //}).catch(function (error) {
            //    console.error('Error', error);
            //    console.error('Stack', error.stack);
            //});
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
