
"use strict";

var crypto = require('crypto');

var db = require('../db/db').get();

module.exports = {
    newToken: function (request) {
        return new Promise(function(resolve, reject) {
            var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
            var token = crypto.randomBytes(32).toString('hex');

            db.tokens.newToken(ip, request.headers['user-agent'], token).then(function () {
                resolve(token);
            }).catch(function (error) {
                console.error('Error creating new token', error);
                console.log('err', error.stack);
            });
        });
    },

    verifyToken: function (token) {
        return new Promise(function(resolve, reject) {
            db.tokens.get(token).then(function (row) {
                if (row !== undefined) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(reject);
        });
    }
};