
"use strict";

var path = require('path');

var sqlite3 = require('sqlite3').verbose();

var queries = require('../queries');

class Tokens {
    constructor (db) {
        this.db = db;
    }

    newToken (remote_address, user_agent, token) {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.db.run(queries.tokens.newToken, [remote_address, user_agent, token], function (error) {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
            resolve();
        });
    }

    all () {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.db.all(queries.tokens.all, function (error, rows) {
                if (error) {
                    reject(error);
                } else {
                    resolve(rows);
                }
            })
        });
    }

    get (token) {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.db.get(queries.tokens.getToken, [token], function (error, row) {
                if (error) {
                    reject(error);
                } else {
                    resolve(row);
                }
            })
        });
    }
}

class DB {
    constructor () {
        var self = this;
        this.db = new sqlite3.Database(path.join(process.cwd(), 'auth.db'));

        Object.keys(queries).forEach(function (tableName) {
            self.db.exec(queries[tableName].create, function (error) {
                if (error) {
                    console.error(`Error initializing table "${tableName}"`, error);
                }
            });
        });

        this.tokens = new Tokens(this.db);
    }
}

var db = null;
module.exports = {
    get: function () {
        if (db === null) {
            db = new DB();
        }
        return db;
    }
};