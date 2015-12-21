
function main () {
    "use strict";

    var token = localStorage.getItem('auth_token');
    if (token) {
        // TODO: Check the token against the api before believing
        $('div.app-container > section.authorized').removeClass('hidden');
    } else {
        $('div.app-container > section.unauthorized').removeClass('hidden');
    }

    $('button.authorize').click(function () {
        var $overlay = $('div.overlay');
        $overlay.removeClass('hidden');

        $('section.status').text('');

        $.ajax({
            url: 'get-token',
            type: 'POST',
            cache: false,
            dataType: 'json'
        }).then(function (result) {
            // TODO: Check for errors and missing token too!
            localStorage.setItem('auth_token', result.token);
            token = result.token;
            $overlay.addClass('hidden');
            $('div.app-container > section.authorized').removeClass('hidden');
            $('div.app-container > section.unauthorized').addClass('hidden');
            $('section.status').removeClass('error').addClass('success').text('Authorization succeeded!');
        }).catch(function (error) {
            console.error('Error', error);
            $overlay.addClass('hidden');
            $('section.status').addClass('error').removeClass('success').text('Authorization failed!');
        })
    });

    $('button.run-playbook').click(function (event) {
        var $target = $(event.currentTarget);
        var playbook = $target.data('playbook');
        var $statusField = $('section.status');

        if (!token) {
            $statusField.addClass('error').removeClass('success').text('Token unavailable. Please re-authrorize!');
            $('div.app-container > section.authorized').addClass('hidden');
            $('div.app-container > section.unauthorized').removeClass('hidden');
            return;
        }

        $statusField.text('');

        $.ajax({
            url: 'playbook/',
            type: 'PUT',
            data: JSON.stringify({playbook: playbook}),
            cache: false,
            dataType: 'json',
            contentType: 'application/json',
            beforeSend: function(xhr) {
                if (token) {
                    xhr.setRequestHeader('Authorization', 'token ' + token);
                }
            }
        }).then(function (result) {
            $('section.status').removeClass('error').addClass('success').text('Command sent.');
        }).catch(function (error) {
            console.error('Error', error);
            if (error.status == 401) {
                localStorage.removeItem('auth_token');
                $('div.app-container > section.authorized').addClass('hidden');
                $('div.app-container > section.unauthorized').removeClass('hidden');
                $statusField.addClass('error').removeClass('success').text('Problem with sending command. Please re-authrorize!');
            } else {
                $statusField.addClass('error').removeClass('success').text(`Unknown error: "${error.responseText}". More information in the console.`);

            }

        })
    });
}

$(document).ready(function () {
    main();
});
