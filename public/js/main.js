
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
        }).catch(function (error) {
            console.error('Error', error);
            $overlay.addClass('hidden');
        })
    });

    $('button.run-playbook').click(function (event) {
        var $target = $(event.currentTarget);
        var playbook = $target.data('playbook');

        $.ajax({
            url: 'playbook/' + playbook,
            type: 'PUT',
            cache: false,
            dataType: 'json',
            beforeSend: function(xhr) {
                if (token) {
                    xhr.setRequestHeader('Authorization', 'token ' + token);
                }
            }
        }).then(function (result) {

        }).catch(function (error) {
            console.error('Error', error);
        })
    });
}

$(document).ready(function () {
    main();
});
