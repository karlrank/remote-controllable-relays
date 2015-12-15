

module.exports = {
    sleep: function (timeout) {
        return new Promise(function (resolve, reject) {
            setTimeout(resolve, timeout);
        });
    }
};
