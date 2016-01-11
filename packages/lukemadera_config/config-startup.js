/**
Meteor.startup calls will likely run BEFORE the (frontend) config variables
 are set. So, this function will be called AFTER they are initialized. Any
 startup that depends on the config should be called from here.
*/
Config.startup =function() {
  if(Meteor.isServer) {
    var cfgEmail =Config.email({});
    Meteor.Sendgrid.config({
      username: cfgEmail.sendgrid.username,
      password: cfgEmail.sendgrid.password
    });

    var cfgAmazon =Config.amazon({});
    S3.config ={
      key: cfgAmazon.s3.key,
      secret: cfgAmazon.s3.secret,
      bucket: cfgAmazon.s3.buckets.mediaCapture,
      // While not documented, region apparently is required and can NOT be
      // set in the ops per call as documented.
      region: cfgAmazon.s3.region
    };
  }
  if(Meteor.isClient) {
    // GoogleMaps.initialize();

    //set publishable key
    // Config.stripe({});

    // Redirect short domain to regular domain
    var appInfo =Config.appInfo({});
    if( (appInfo.shortDomain !== appInfo.domain ) && window.location.hostname ===appInfo.shortDomain) {
      var regEx =new RegExp(appInfo.shortDomain);
      var newLoc =window.location.href.replace(regEx, appInfo.domain);
      console.info("Redirecting "+appInfo.shortDomain+" to "+appInfo.domain+" ...");

      // Check for https too to avoid double redirect.
      httpsUrl =_Config.httpsRedirect(newLoc);
      if(httpsUrl.redirectUrl) {
        newLoc =httpsUrl.redirectUrl;
      }

      window.location.href =newLoc;
    }
    else {
      // Redirect http to https, if using https scheme
      httpsUrl =_Config.httpsRedirect(null);
      if(httpsUrl.redirectUrl) {
        window.location.href =httpsUrl.redirectUrl;
      }
    }
  }
};

_Config.httpsRedirect =function(url) {
  url = url || window.location.href;
  var ret ={
    redirectUrl: null
  };
  var appInfo =Config.appInfo({});
  if( appInfo.scheme === 'https' && url.indexOf('http://') > -1 ) {
    var regEx =new RegExp('http://');
    var newLoc =url.replace(regEx, 'https://');
    console.info("Redirecting http to https...");
    ret.redirectUrl =newLoc;
  }
  return ret;
};