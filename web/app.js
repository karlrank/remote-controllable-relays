
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser')

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

        app.use(bodyParser.json());

        app.use(express.static('public'));

        app.post('/get-token', function (req, res) {
            var done = false;
            stateController.stateReaderWriter.startBlinkingStatusLed();

            var onSwitchPressed = function (nr, time) {
                if (nr === config.authSwitchNr && time > config.authSwitchPressThreshold) {
                    Authentication.newToken(req).then(function (token) {
                        stateController.stateReaderWriter.stopBlinkingStatusLed();
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
                    stateController.stateReaderWriter.stopBlinkingStatusLed();
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
                    res.status(401).send('Invalid token.');
                }
            }).catch(function (error) {
                console.error('Error verifying token', error);
                res.sendStatus(401);
            });
        });

        app.put('/playbook/', function (req, res) {
            if (!req.body.playbook) {
                res.sendStatus(400).send('Missing playbook name from json body');
            } else {
                stateController.runPlaybook(req.body.playbook);
                res.json({status: 'Done.'});
            }
        });

        stateController.stateReaderWriter.on('ready', function () {
            stateController.stateReaderWriter.statusLEDOn();
        });

        return app;
    }
};


