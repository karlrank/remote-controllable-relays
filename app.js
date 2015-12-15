var crypto = require('crypto');

var express = require('express');
var app = express();

var StateController  = require('./modules/StateController');
var util = require('./util/util');


var stateController = new StateController();
stateController.run();


app.get('/', function (req, res) {
    console.log('get-util', util);
    res.send('Hello World!');
});


app.post('/driveway-on', function (req, res) {
    Promise.resolve().then(function () {
        stateController.relayState.relayOn(1);
        return Promise.resolve();
    }).then(function () {
        return util.sleep(300);
    }).then(function () {
        stateController.relayState.relayOn(2);
        return Promise.resolve();
    }).then(function () {
        return util.sleep(300);
    }).then(function () {
        stateController.relayState.relayOn(3);
        return Promise.resolve();
    }).catch(function (error) {
        console.error('Error switching on driveway', error);
        res.sendStatus(500);
    });
    res.send('');
});

app.post('/driveway-off', function (req, res) {
    stateController.relayState.relayOff(1);
    stateController.relayState.relayOff(2);
    stateController.relayState.relayOff(3);
    res.send('');
});

stateController.switchState.on('switchPressed', function (nr, time) {
    console.log('PRESSED: nr', nr, 'time', time);
});


app.post('/get-code', function (req, res) {
    var done = false;
    var onSwitchPressed = function (nr, time) {
        if (nr === 8 && time > 100) {
            console.log('responding');
            res.json({
                code: crypto.randomBytes(32).toString('hex')
            });
            stateController.switchState.removeListener('switchPressed', onSwitchPressed);
            done = true;
        }
    };

    stateController.switchState.on('switchPressed', onSwitchPressed);

    setTimeout(function () {
        if (!done) {
            stateController.switchState.removeListener('switchPressed', onSwitchPressed);
            res.sendStatus(404);
        }
    }, 30 * 1000);
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
