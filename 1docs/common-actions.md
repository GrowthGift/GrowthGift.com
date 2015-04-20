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
  - prod: `meteor deploy APPNAME.meteor.com --settings=settings-prod.json`
  - dev: `meteor deploy APPNAMEDEV.meteor.com`
2.  package/build for mobile
  - run (use `ios-device` instead for ios)
    - prod: `ENV=prod meteor run android-device --mobile-server http://APPNAME.meteor.com`
    - dev: `meteor run android-device --mobile-server http://APPNAMEDEV.meteor.com`
  - build
    - prod: `ENV=prod meteor build ~/Documents/web/1mobile-build/APPNAME --server APPNAME.meteor.com`
    - dev: `meteor build ~/Documents/web/1mobile-build/APPNAME --server APPNAMEDEV.meteor.com`
3. upload the .apk/.ipa and do android/ios specific app store stuff
  1. Android: https://github.com/meteor/meteor/wiki/How-to-submit-your-Android-app-to-Play-Store
    1. `cd ~/Documents/web/1mobile-build/APPNAME/android && jarsigner -digestalg SHA1 unaligned.apk APPNAME`
    2. `~/.meteor/android_bundle/android-sdk/build-tools/20.0.0/zipalign 4 unaligned.apk production.apk`

## Add new page / route
- create new files (html, js, import.less) in a (root level) folder
- add the route to `lib/router.js`
- import/add the less file to `client/less/_base.less`
- (optional) add to nav (header, menu) to customize auth, display for this page

## Add a new package
- `meteor create --package [meteor_developer_username]:[package_name]`
- `meteor add [meteor_developer_username]:[package_name]`