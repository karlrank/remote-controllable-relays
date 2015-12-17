var crypto = require('crypto');

var RelayState = require('./modules/RelayState');
var SwitchState = require('./modules/SwitchState');
var StateReaderWriter = require('./modules/StateReaderWriter');
var StateController  = require('./modules/StateController');
var config = require('./config');


var stateReaderWriter = new StateReaderWriter(
    new RelayState(config.relayCount),
    new SwitchState(config.switchCount),
    {
        SPIPort: config.SPIPort,
        relayLatchPin: config.relayLatchPin,
        switchPLPin: config.switchPLPin,
        switchCEPin: config.switchCEPin,
        switchOEPin: config.switchOEPin
    }
);

var stateController = new StateController(stateReaderWriter, process.stdout);
stateController.run();

var app = require('./web/app').get(stateController);

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
