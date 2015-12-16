
"use strict";

var stream = require('stream');

class ConsoleLogStream extends stream.Writable {

    constructor () {
        super({
            decodeStrings: false
        });
        this.buffer = "";
    }

    _write (chunk, encoding, callback) {
        var chunkParts = chunk.split('\n');
        if (chunkParts.length === 1) {
            this.buffer += chunkParts[0];
        } else {
            for (var i = 0; i < chunkParts.length; i++) {
                var chunkPart = chunkParts[i];
                this.buffer += chunkPart;
                if (this.buffer.length > 0) {
                    console.log(this.buffer);
                }
                this.buffer = "";
            }
        }

        callback();
    }
}

module.exports = ConsoleLogStream;