# Meteor Cordova Notes

## Android

- https://www.meteor.com/try/7
- https://github.com/meteor/meteor/wiki/How-to-submit-your-Android-app-to-Play-Store

- Linux (Ubuntu) issues
  - I had issues just running Android and getting my device to be recognized
    - http://developer.android.com/tools/device.html#setting-up

### Icons, Splash Screens
- use 9 patch png
  - http://stackoverflow.com/questions/13487124/android-splash-screen-sizes-for-ldpi-mdpi-hdpi-xhdpi-displays-eg-1024x76


## iOS

### Certificates/provisioning

You need the following for each app to test internally:
  1. Apple Developer account (Paid - one account works for multiple apps)  
  2. AppID with a unique BundleID (unique to each app)
  3. a Development Provisioning profile (to develop on devices without testflight)
  optional:
  4. if you need push, through the AppId, add a development push certificate

In addition, you need the following for each app to test on testFlight/release:
  5. a Distribution Provisioning profile (to develop on devices with testflight / release on app store)
  optional:
  4. if you need push, through the AppId, add a distribution push certificate

### Push notifications

1. Turn on Push Notifications by editing your AppID settings for the target app
2a. For local development (not through iTunes Connect): create a Apple Push Notification service  **Development** SSL Certificate
2b. For production development (through iTunes Connect/testflight): create a Apple Push Notification service  **Production** SSL Certificate
3. Create .pem files: https://github.com/raix/push/blob/master/docs/IOS.md
4. configure the gateway for push to be gateway.sandbox.push.apple.com" for the local development environment, or "gateway.push.apple.com" for the testflight/production environment

### Building for Deployment to iTunes Connect

variables (replace accordingly)
APPNAME appName

1. Run "meteor build <bundle path> --server <host>:<port>"
2. Open Xcode project file
3. manually change the bundleId to your app's bundleId in {{APPNAME-info.plist}}
4.manually change the (incorrectly sized) icon-72.png and icon_72@2x.png with the correctly sized versions. keep the names as "icon-72.png" and "icon_72@2x.png"
5. Change iOS deployment target to 7.0+
6. Change version or build number


### Test Flight Internal Testers

This process is fairly convoluded. Follow these steps:
1. [admin] Invite a NEW iTunes Connect email (can NOT seem to invite an existing one..). Just use a '+' plus address.
2. [user] Should receive an email; need to confirm and set up the NEW iTunes Connect account.
3. [admin] After the NEW iTunes Connect user is created / verified, then add this user as an Internal Tester for the app and 'invite' them (note they will already need to be added in the main 'Users and Roles' section on itunesconnect.com that is before/outside the specific app)
4. [user] Accept the TestFlight invite via email and open the app via TestFlight - SEE STEPS BELOW
  1. Make sure you are logged into the iTunes Connect account you want to use on your phone (does NOT have to be the same as the one the email was sent to or that the admin added) as TestFlight does NOT allow setting the iTunes Connect account / id or logging out / switching; it just uses what is setting in the global iOS app settings. Additionally, once you accept the invite, you will NOT be able to accept it again on a different account - so you only get ONE shot here!
  2. Open SAFARI or the NATIVE mail app (will NOT work with gmail app or on Chrome or another non-Safari browser!!) and go to your email and then click the button/link to accept the invite and open up TestFlight. Follow the steps/prompts (to download/install the beta app).
    1. http://stackoverflow.com/questions/25802364/beta-testing-with-internal-testers-for-ios-8
  3. Now you should have the app on your phone (as it's own app with it's own icon, separate from TestFlight) so you can use it!



## Getting Started
- read / learn
  - link: https://github.com/meteor/meteor/wiki/Meteor-Cordova-Phonegap-integration
  