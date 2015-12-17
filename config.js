
var dnsUpdateToken = 'afce7101-aaf4-40ea-86ca-302a8507d1d8',
    dnsDomainName = 'kadarpiku',
    dnsUpdateUrl = `https://www.duckdns.org/update?domains=${dnsDomainName}&token=${dnsUpdateToken}&ip=`;

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
    switchOEPin: 12,

    dnsUpdateInterval: 5 * 60 * 1000,
    dnsUpdateUrl: dnsUpdateUrl
};
