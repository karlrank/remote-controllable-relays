
var express = require('express');
var morgan = require('morgan');

var StateController  = require('../modules/StateController');
var util = require('../util/util');
var config = require('../config');
var Authentication = require('../modules/Authentication');

module.exports = {
    get: function (stateController, outStream) {
        var app = express();

        app.use(morgan('short', {
            stream: outStream
        }));

        app.post('/get-token', function (req, res) {
            var done = false;

            var onSwitchPressed = function (nr, time) {
                if (nr === config.authSwitchNr && time > config.authSwitchPressThreshold) {
                    Authentication.newToken(req).then(function (token) {
                        res.json({
                            token: token
                        });
                        stateController.switchState.removeListener('switchPressed', onSwitchPressed);
                        done = true;
                    }).catch(function (error) {
                        console.log('Error getting new token', error);
                    });
                }
            };

            stateController.switchState.on('switchPressed', onSwitchPressed);

            setTimeout(function () {
                if (!done) {
                    stateController.switchState.removeListener('switchPressed', onSwitchPressed);
                    res.sendStatus(404);
                }
            }, config.authSwitchTimeout);
        });


        // This middleware only applies to the routes below this point
        app.use(function (request, res, next) {

            if (request.headers.authorization === undefined || typeof(request.headers.authorization) !== 'string' ||
                !request.headers.authorization.startsWith('token ')) {
                res.sendStatus(401);
                return;
            }

            var token = request.headers.authorization.split(' ')[1];
            if (token === undefined) {
                res.sendStatus(401);
                return;
            }

            Authentication.verifyToken(token).then(function (verificationResult) {
                if (verificationResult) {
                    next()
                } else {
                    res.status(500).send('Invalid token.');
                }
            }).catch(function (error) {
                console.error('Error verifying token', error);
                res.sendStatus(500);
            });
        });

        app.put('/driveway-on', function (req, res) {
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
            res.json({status: 'Done.'});
        });

        app.put('/driveway-off', function (req, res) {
            stateController.relayState.relayOff(1);
            stateController.relayState.relayOff(2);
            stateController.relayState.relayOff(3);
            res.json({status: 'Done.'});
        });

        return app;
    }
};


