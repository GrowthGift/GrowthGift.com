## Deploy

variables (replace accordingly)
APPNAME appName
APPNAMEDEV appNameDev

1. Deploy to server:
  - prod non meteor: `npm run prod` OR for Windows: `npm run prodWin`
    - NOTE: the FIRST time you'll have to do `chmod 400 1credentials/todoseed.pem` to set the permissions for ssh into the server
    - NOTE: apparently the `meteor build` tarball file name can not be set and it will just take the directory name so you MUST name your project folder `todoseed`
    - TODO: un-hardcoded meteor settings from METEOR_SETTINGS variable
    - TODO: un-hardcode other things too?
  - prod: `cd env/prod && mup deploy && cd ../../`
  - dev: `meteor deploy growthgiftdev.meteor.com --settings env/dev/settings.json`
2.  package/build for mobile
  - run (use `ios-device` instead for ios)
    - prod: `ENV=prod meteor run android-device --mobile-server https://growthgift.com --settings env/prod/settings.json`
    - dev: `meteor run android-device --mobile-server http://growthgiftdev.meteor.com --settings env/dev/settings.json`
  - build
    - prod: `ENV=prod meteor build ~/Documents/projects/1mobile-build/growthgift --server https://growthgift.com --mobile-settings env/prod/settings.json`
      - ios: open xcode project and fix things then build .ipa file
        - run dev version first (NOTE: can not figure out how to run the SAME project on device and for distribution release..)
        - delete project after confirm working, then rebuild it
        - manage schemes to rename to proper one (was showing 'dev' but should be prod)
        - edit scheme build target (remove bad missing one and re-add proper one)
        - update build settings code signing to use distribution certificate & provisioning profile
        - update general bundle identifier (com.growthgift)
        - bump version (or build) number
        - set device orientations to all
        - set build to generic device
        - run then archive
    - dev: `meteor build ~/Documents/web/1mobile-build/APPNAME --server APPNAMEDEV.meteor.com --mobile-settings env/dev/settings.json`
3. upload the .apk/.ipa and do android/ios specific app store stuff
  1. Android: https://github.com/meteor/meteor/wiki/How-to-submit-your-Android-app-to-Play-Store
    1. `cd ~/Documents/projects/1mobile-build/growthgift/android && jarsigner -digestalg SHA1 release-unsigned.apk growthgift`
    2. `$ANDROID_HOME/build-tools/23.0.2/zipalign 4 release-unsigned.apk production.apk`

## Add new page / route
- create new files (html, js, import.less) in a (root level) folder
- add the route to `lib/router.js`
- import/add the less file to `client/less/_base.less`
- (optional) add to nav (header, menu) to customize auth, display for this page

## Add a new package
- `meteor create --package [meteor_developer_username]:[package_name]`
- `meteor add [meteor_developer_username]:[package_name]`


## Rebuild (add or remove from) Lodash

https://lodash.com/custom-builds
`cd lib/lodash && lodash -p include=capitalize,extend`


## Make Push Certs

### Prod

openssl x509 -in aps_production_growth_gift_prod.cer -inform der -out PushGrowthGiftProdCert.pem
openssl pkcs12 -nocerts -out PushGrowthGiftProdKey.pem -in LukeGrowthGiftProdPush.p12
cat PushGrowthGiftProdCert.pem PushGrowthGiftProdKey.pem > PushGrowthGiftProd.pem
openssl s_client -connect gateway.push.apple.com:2195 -CAfile entrust_2048_ca.cer -cert PushGrowthGiftProdCert.pem -key PushGrowthGiftProdKey.pem

### Dev

openssl x509 -in aps_development_growthgiftdev.cer -inform der -out PushGrowthGiftDevCert.pem
openssl pkcs12 -nocerts -out PushGrowthGiftDevKey.pem -in LukeGrowthGiftDevPush.p12
cat PushGrowthGiftDevCert.pem PushGrowthGiftDevKey.pem > PushGrowthGiftDev.pem
openssl s_client -connect gateway.sandbox.push.apple.com:2195 -CAfile entrust_2048_ca.cer -cert PushGrowthGiftDevCert.pem -key PushGrowthGiftDevKey.pem