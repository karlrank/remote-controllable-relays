
"use strict";

var request = require('request');

var config = require('../config');

class DuckDnsUpdater {
    constructor () {
        "use strict";

    }

    update () {
        "use strict";
        request(config.dnsUpdateUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('Getting response', body); // Show the HTML for the Google homepage.
            } else {
                console.error('error', error);
            }
        })
    }

    run () {
        var self = this;
        "use strict";
        self.update();
        this.updatingInterval = setInterval(function () {
            console.log('Updating DNS');
            self.update();
        }, config.dnsUpdateInterval);
    }

    stop () {
        clearInterval(this.updatingInterval);
    }

}

module.exports = DuckDnsUpdater;
