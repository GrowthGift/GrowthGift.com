# Digital Ocean

## Server Setup

- create new droplet
  - Ubuntu (most recent, i.e. 14.04)
  - add SSH key [see below but best to do this BEFORE creating the droplet to save some steps]
- set up & use SSH key
  - https://www.digitalocean.com/community/tutorials/how-to-use-ssh-keys-with-digitalocean-droplets
  - ssh in to connect
    - to password-less login with with non-root users, add the new users and add the (same) public key to each user's `~/.ssh/authorized_keys` file (probably need to create this file for each user first) [see below]
      `cat ~/.ssh/id_rsa.pub | ssh [username]@[your.ip.address.here] "cat >> ~/.ssh/authorized_keys"`
- set up linux ubuntu server as normal / as needed


## Domain Names

- add a domain on the Digital Ocean control panel
- point the A record at your domain registrar (i.e. GoDaddy) to your Droplet IP address
  - can optionally lower the TTL first and wait a period of time equal to the original TTL to make the change and this will make it much faster to propagate. Then once the propagation is done, re-raise the TTL for better caching / performance.
    - http://kb.mediatemple.net/questions/908/Understanding+TTL+(time-to-live)


## SSH Pub Key for non-root

```
mkdir ~/.ssh
chmod 0700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 0644 ~/.ssh/authorized_keys
```

I realize this is a bit late, but I had the same problem and managed to solve it. Here are the set of commands that you need to run as root on a new digital ocean droplet (assuming you have already setup root to have ssh access). This will setup mynewuser with passwordless sudo rights and the ability to ssh into the machine without a password (using only your ssh-key)
```
adduser --system --group mynewuser
mkdir /home/mynewuser/.ssh
chmod 0700 /home/mynewuser/.ssh/
cp -Rfv /root/.ssh /home/mynewuser/
chown -Rfv mynewuser.mynewuser /home/mynewuser/.ssh
chown -R mynewuser:mynewuser /home/mynewuser/
gpasswd -a mynewuser sudo
echo "mynewuser ALL=(ALL) NOPASSWD: ALL" | (EDITOR="tee -a" visudo)
service ssh restart
usermod -s /bin/bash mynewuser
```

Now you should be able to ssh into your new droplet with
`ssh mynewuser@your-new-digitalocean-droplet-ip-address`