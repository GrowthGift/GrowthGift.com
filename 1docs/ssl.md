# SSL

We used LetsEncrypt because it is free. This guide is nearly correct:
https://forums.meteor.com/t/setting-up-ssl-with-letsencrypt-and-meteorup/14457

We did NOT use the `force-ssl` package; so not tested with it, but working
 without it.

2 key missing steps:
https://forums.meteor.com/t/mup-and-ssl-configuration/2489

1. set `ROOT_URL` to `https`
2. run `mup setup` (then `mup deploy`)


## Cordova apps

Make sure to use `https` in front of the `--mobile-server` command otherwise
 a `Mixed Content` error will happen (on `sockjs`).