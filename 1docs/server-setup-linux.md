# Linux

## Ubuntu

USERNAME lmadera

- [as root user] add users and give sudo privileges
  - `adduser USERNAME`
  - `adduser USERNAME sudo`
  - log out then re-login as this new user
- `sudo apt-get update`
- install git: `sudo apt-get install git-core`
- install node.js
  - https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
    - scroll down to the 'Ubuntu' section and follow the instructions / commands there
  - may need `make` command for npm install so install:
    - `sudo apt-get install build-essential`
- install global npm modules
  - `sudo npm install -g forever`
- set password-less sudo
  - https://github.com/arunoda/meteor-up#ssh-based-authentication
  - `sudo visudo`
  - replace the `%sudo  ALL=(ALL) ALL` line with `%sudo ALL=(ALL) NOPASSWD:ALL`


- make deploy script
  - http://blog.differential.com/use-package-json-in-your-meteor-app-for-fun-profit/
  - http://stackoverflow.com/questions/4412238/whats-the-cleanest-way-to-ssh-and-run-multiple-commands-in-bash