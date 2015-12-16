
module.exports = {

    relayCount: 6,
    switchCount: 8,
    authSwitchNr: 8,

    syncInterval: 10,
    switchDeBounceTime: 10,
    authSwitchTimeout: 60 * 1000,
    authSwitchPressThreshold: 100,

    // PINS & PORTS
    SPIPort: '/dev/spidev0.0',
    relayLatchPin: 7,
    switchPLPin: 11,
    switchCEPin: 13,
    switchOEPin: 12
};
