
var fs = require('fs');
var path = require('path');

var dust = require('dustjs-linkedin');

module.exports = {
    loadTemplate: function (name, template) {
        var templateSource = fs.readFileSync(path.join(process.cwd(), 'test-gui/gui', template)).toString('utf-8');
        dust.loadSource(dust.compile(templateSource, name));
    }
};