
# List networks
sudo iwlist wlan0 scan

# Edit file
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf

# Add to the end of file

network={
    ssid="The_ESSID_from_earlier"
    psk="Your_wifi_password"
}


# Reset interface to connect
sudo ifdown wlan0
sudo ifup wlan0
