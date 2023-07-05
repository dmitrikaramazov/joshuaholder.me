---
title: "Wireguard"
date: 2023-07-05T14:54:38-05:00
draft: false
description: "testing"
tags: ["wireguard",
       "debian",
       "tutorial"]
author: "Test"
---



This is a rewrite of DigitalOcean's guide for setting up WireGuard on Ubuntu. Their guide is [linked here](https://www.digitalocean.com/community/tutorials/how-to-set-up-wireguard-on-ubuntu-20-04)




## Setting up the WireGuard server

<br>
t
<br>
t
<br>






### Install WireGuard

```
sudo apt install wireguard
```

### Generate server keys

```
wg genkey | sudo tee /etc/wireguard/private.key
sudo chmod go= /etc/wireguard/private.key
```

The `sudo chmod go= ...` removes all permissions on the file for all users and groups other than root user. This ensures only the root user has access to the private key.

The private key generated is base64 encoded and looks like `AK+TFHruAB0Q5eOcpYVIGDNnzBvYfDVPFtr3nx3IJ20=` then is used in the creation of the public key.

To generate the public key enter the command:
```
sudo cat /etc/wireguard/private.key | wg pubkey | sudo tee /etc/wireguard/public.key
```

The `sudo cat ...` command reads the private key and pipes it into the next command, `wg`. `wg pubkey` generates the public key and pipes it into `sudo tee ...` which places the output in a file titled `public.key` 


### Creating WireGuard server config

This is where we'll want to make the config file which tells wireguard how to behave.

To do so enter:
```
sudo nano /etc/wireguard/wg0.conf
```

This will be the config file for the interface `wg0` and within it enter the following:
```
[Interface]
Address = 10.8.0.1/24
SaveConfig = true
ListenPort = 51820
PrivateKey = AK+TFHruAB0Q5eOcpYVIGDNnzBvYfDVPFtr3nx3IJ20= # Example server private key
```

This sets the address, what IPv4 or IPv6 addresses or ranges is WireGuard allowed to assign, the listening port as 51820, and the server private key. 

My home network is a `10.0.0.0/24` so using `10.8.0.1/24` should be fine I think. Technically they're in different subnets though so I'm not sure if devices could talk to each other. At the moment, I am able to ping my server from my peer and my peer from my server, but not a local desktop to a peer. 

You can also do IPv6, but I chose not to. The DigitalOcean page has more information on how to do that. That was a mistake so I'll go back and add IPv6.

### Setting up the server's network config

You'll have to tell the server to allow IP forwarding. This is disabled by default.

Open up `/etc/sysctl.conf`
```
sudo nano /etc/sysctl.conf
```
And uncomment the two lines
```

# Uncomment the next line to enable packet forwarding for IPv4
net.ipv4.ip_forward=1

# Uncomment the next line to enable packet forwarding for IPv6
#  Enabling this option disables Stateless Address Autoconfiguration
#  based on Router Advertisements for this host
net.ipv6.conf.all.forwarding=1

```
Then, reaload the new values with `sudo sysctl -p`

### Setting up the servers firewall

You'll want to allow whatever port you chose on your firewall. In my case I used the default WireGuard port over 51820/udp and I'm using ufw.

```
sudo ufw allow 51820/udp
```

I'm not sure if this is necessary, but I've been doing this whenever changes are made to restart ufw.
```
sudo ufw disable
sudo ufw enable
```

You'll want to make sure WireGuard routes traffic appropriately by modifying the `/etc/wireguard/wg0.conf` file again.

It should look something like this:
```
[Interface]
PrivateKey = [private server key ]
Address = 10.8.0.1/24, fd0d:86fa:c3bc::1/64
ListenPort = 51820
SaveConfig = true



PostUp = ufw route allow in on wg0 out on wlan0
PostUp = iptables -t nat -I POSTROUTING -o wlan0 -j MASQUERADE
PostUp = ip6tables -t nat -I POSTROUTING -o wlan0 -j MASQUERADE
PreDown = ufw route delete allow in on wg0 out on wlan0
PreDown = iptables -t nat -D POSTROUTING -o wlan0 -j MASQUERADE
PreDown = ip6tables -t nat -D POSTROUTING -o wlan0 -j MASQUERADE
```


After this is done we can start up the WireGuard server.

```
sudo systemctl enable wg-quick@wg0.service
sudo systemctl start wg-quick@wg0.service
sudo systemctl status wg-quick@wg0.service
```

I ran into a few issues here where an ip link was already created titled wg0. All you have to do is `sudo ip link remove wg0` and go through the commands above once again. 

### Creating the WireGuard peer

I was using the android app. The app generates its own public/private key. You can also enter the IP addresses, `10.8.0.2/32` in my case and the DNS server in the interface section. In the app's peer section you'll want to put the public IP of your WireGuard server followed by :51820, or whatever port you chose, and enter the server public key. 

```
sudo wg set wg0 peer [Peer public key] allowed-ips 10.8.0.2
```




## References
Not as useful
https://upcloud.com/resources/tutorials/get-started-wireguard-vpn

Very useful
https://www.digitalocean.com/community/tutorials/how-to-set-up-wireguard-on-ubuntu-20-04


https://www.wireguardconfig.com/