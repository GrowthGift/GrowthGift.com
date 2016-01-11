// Meteor settings / environment variables are not loaded yet? So can not use them..
var env = (this.process.env !== undefined && this.process.env.ENV !== undefined)
 ? this.process.env.ENV : 'dev';
App.info({
  // Too late for this.. can not change after publish to (Android)
  // app store the first time..
  // id: ( env === 'prod' ) ? 'com.growthgift' : 'com.meteor.growthgiftdev',
  name: ( env === 'prod' ) ? 'GrowthGift' : 'GrowthGiftDev',
  description: 'Grow togther.',
  // author: 'Percolate Studio Team',
  // email: 'us@percolatestudio.com',
  website: ( env === 'prod' ) ? 'growthgift.com' : 'growthgiftdev.meteor.com',
  version: '1.2.2'
});

App.icons({
  // iOS
  'iphone': 'public/app-assets/icon-60.png',
  'iphone_2x': 'public/app-assets/icon-120.png',
  'iphone_3x': 'public/app-assets/icon-180.png',
  'ipad': 'public/app-assets/icon-76.png',
  'ipad_2x': 'public/app-assets/icon-152.png',

  // Android
  'android_ldpi': 'public/app-assets/icon-36.png',
  'android_mdpi': 'public/app-assets/icon-48.png',
  'android_hdpi': 'public/app-assets/icon-72.png',
  'android_xhdpi': 'public/app-assets/icon-96.png',
  // 'android_xxhdpi': 'public/app-assets/icon-144.png',    //not supported?
  // 'android_xxxhdpi': 'public/app-assets/icon-192.png'    //not supported?
});

App.launchScreens({
  // iOS
  'iphone': 'public/app-assets/launch320x480.png',
  'iphone_2x': 'public/app-assets/launch640x960.png',
  'iphone5': 'public/app-assets/launch640x1136.png',
  'iphone6': 'public/app-assets/launch750x1334.png',
  'iphone6p_portrait': 'public/app-assets/launch1242x2208.png',
  'ipad_portrait': 'public/app-assets/launch768x1024.png',
  'ipad_portrait_2x': 'public/app-assets/launch1536x2048.png',
  'ipad_landscape': 'public/app-assets/launch1024x768.png',
  // 'ipad_landscape_2x': 'public/app-assets/launch2048x1536.png',

  // Android
  //@todo - make these dimensions and use them. And/or 9-patch .png?
  // 'android_ldpi_portrait': 'public/app-assets/launch200x320.png',
  // 'android_ldpi_landscape': 'public/app-assets/launch320x200.png',
  // 'android_mdpi_portrait': 'public/app-assets/launch320x480.png',
  // 'android_mdpi_landscape': 'public/app-assets/launch480x320.png',
  // 'android_hdpi_portrait': 'public/app-assets/launch480x800.png',
  // 'android_hdpi_landscape': 'public/app-assets/launch800x480.png',
  // 'android_xhdpi_portrait': 'public/app-assets/launch720x1280.png',
  // 'android_xhdpi_landscape': 'public/app-assets/launch1280x720.png'

  'android_ldpi_portrait': 'public/app-assets/launch320x480.png',
  'android_ldpi_landscape': 'public/app-assets/launch1024x748.png',
  'android_mdpi_portrait': 'public/app-assets/launch320x480.png',
  'android_mdpi_landscape': 'public/app-assets/launch1024x748.png',
  'android_hdpi_portrait': 'public/app-assets/launch768x1024.png',
  'android_hdpi_landscape': 'public/app-assets/launch1024x768.png',
  'android_xhdpi_portrait': 'public/app-assets/launch1280x1920.png',
  'android_xhdpi_landscape': 'public/app-assets/launch1920x1280.png'
});

App.setPreference('StatusBarOverlaysWebView', 'true');
App.setPreference('StatusBarStyle', 'lightcontent');
App.setPreference('StatusBarBackgroundColor', '#8E9599');
// App.setPreference('deployment-target', '7.0'); // not sure if this works, according to phonegap, it should...

//meteor local is supposed to be auto included but was not?
App.accessRule('*://meteor.local/*');
App.accessRule('*://10.0.2.2/*');
//environment specific (dev, prod) domains
App.accessRule('*://*.growthgiftdev.meteor.com/*');
App.accessRule('*://*.growthgift.com/*');
App.accessRule('*://*.gr0.co/*');
App.accessRule('*://107.170.212.162/*');

//google maps, places
// App.accessRule('https://maps.googleapis.com/*');
// App.accessRule('https://maps.gstatic.com/*');

// Social sharing
App.accessRule('*://*.facebook.com/*');
App.accessRule('*://*.fbcdn.net/*');
App.accessRule('*://*.gmail.com/*');
App.accessRule('*://*.google.com/*');
App.accessRule('*://*.linkedin.com/*');
App.accessRule('*://*.pinterest.com/*');
App.accessRule('*://*.twitter.com/*');

// App.accessRule('mailto:*', true);
// App.accessRule('sms:*', true);

// Images
App.accessRule('*://*/*.jpg');
App.accessRule('*://*/*.png');

// Video
App.accessRule('*://*.youtube.com/*');
App.accessRule('*://*.ytimg.com/*');
App.accessRule('*://*.gstatic.com/*');
App.accessRule('*://*.googlevideo.com/*');

// Aamazon (S3)
App.accessRule('*://*.amazonaws.com/*');

