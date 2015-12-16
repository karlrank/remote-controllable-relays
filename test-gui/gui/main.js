
var $ = require('./js/lib/jquery');
var _ = require('lodash');
var dust = require('dustjs-linkedin');

var config = require('../../config');
var helper = require('./js/helper');
var RelayState = require('../../modules/RelayState');
var SwitchState = require('../../modules/SwitchState');
var StateController = require('../../modules/StateController');
var GuiStateReaderWriter = require('./js/GuiStateReaderWriter');
var ConsoleLogStream = require('./js/ConsoleLogStream');

helper.loadTemplate('main', 'template/main.dust');

var relayState = new RelayState(config.relayCount);
var switchState = new SwitchState(config.switchCount);

function main() {
    "use strict";

    $('section.switches > div.switch > div.toggle-switch').on('click', function (event) {
        var $target = $(event.currentTarget);
        $target.parent().toggleClass('on').toggleClass('off');
    });

    var switchClickInProgress = false;
    var wasOn = false;
    $('section.switches > div.switch > div.push-button'
     ).on('mousedown', function (event) {
        var $target = $(event.currentTarget);
        wasOn = $target.parent().hasClass('on');
        switchClickInProgress = true;
        $target.parent().addClass('on').removeClass('off');
    }).on('mouseup', function (event) {
        switchClickInProgress = false;
        var $target = $(event.currentTarget);
        if (!wasOn) {
            $target.parent().removeClass('on').addClass('off');
        }
    }).on('mouseout', function (event) {
        var $target = $(event.currentTarget);
        if (switchClickInProgress && !wasOn) {
            $target.parent().removeClass('on').addClass('off');
        }
    });

    var stateReaderWriter = new GuiStateReaderWriter(relayState, switchState, $('section.switches'), $('section.relays'));
    var stateController = new StateController(stateReaderWriter);
    stateController.run();

    var app = require('../../web/app').get(stateController, new ConsoleLogStream());

    var server = app.listen(3000, function () {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Example app listening at http://%s:%s', host, port);
    });

}

$(document).ready(function () {
    dust.render('main', {
        switches: switchState.asArray(),
        relays: relayState.asArray()
    }, function (error, out) {
        if (!error) {
            $('div.app-container').html(out);
            main();
        } else {
            console.error('Error occurred while rendering template', error);
        }
    });
});