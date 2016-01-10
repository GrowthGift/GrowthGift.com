# SSL

We used LetsEncrypt because it is free. This guide is nearly correct:
https://forums.meteor.com/t/setting-up-ssl-with-letsencrypt-and-meteorup/14457

2 key missing steps:
https://forums.meteor.com/t/mup-and-ssl-configuration/2489

1. set `ROOT_URL` to `https`
2. run `mup setup` (then `mup deploy`)


## Cordova apps

Make sure to use `https` in front of the `--mobile-server` command otherwise
 a `Mixed Content` error will happen (on `sockjs`).

Also, need to use a domain, NOT an ip address, otherwise (iOS) will not work.
 Seemed to be find with just the regular domain (no short domain), since short
 domain just redirects?