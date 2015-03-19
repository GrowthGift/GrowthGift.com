## Deploy

variables (replace accordingly)
APPNAME appName
APPNAMEDEV appNameDev

1. Deploy to server:
  - prod: `meteor deploy APPNAME.meteor.com --settings=settings-prod.json`
  - dev: `meteor deploy APPNAMEDEV.meteor.com`
2.  package/build for mobile
  `meteor run ios-device --mobile-server http://APPNAME.meteor.com`
OR
  `meteor build ~/Documents/web/1mobile-build/APPNAME --server APPNAME.meteor.com`
3. upload the .apk/.ipa and do android/ios specific app store stuff
  1. Android: https://github.com/meteor/meteor/wiki/How-to-submit-your-Android-app-to-Play-Store
    1. `cd ~/Documents/web/1mobile-build/APPNAME/android && jarsigner -digestalg SHA1 unaligned.apk APPNAME`
    2. `~/.meteor/android_bundle/android-sdk/build-tools/20.0.0/zipalign 4 unaligned.apk production.apk`

## Add new page / route
- create new files (html, js, import.less) in a (root level) folder
- add the route to `lib/router.js`
- import/add the less file to `client/less/_base.less`

## Add a new package
- `meteor create --package [meteor_developer_username]:[package_name]`
- `meteor add [meteor_developer_username]:[package_name]`