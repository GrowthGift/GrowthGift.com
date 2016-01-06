Config.email =function(params) {
  var appName ='GrowthGift';
  var emailDomain ='growthgiftdev.meteor.com';
  if(Config.ENV ==='prod') {
    appName ='GrowthGift';
    emailDomain ='growthgift.com';
  }
  var ret ={
    "addresses": {
      "contact": {
        "name": appName+" Contact",
        "email": "contact@"+emailDomain
      },
      "notify": {
        "name": appName+" Notification",
        "email": "notify@"+emailDomain
      }
    },
    "sendgrid": {
      "username": "growthgiftdev1",
      "password": "nQsmm73nG5kcRFZ"
    }
  };
  if(Config.ENV ==='prod') {
    ret.sendgrid ={
      "username": "growthgift1",
      "password": "J69W29k5997snGn"
    };
  }
  return ret;
};

Config.amazon =function(params) {
  var ret ={
    s3: {
      key: 'AKIAJU3XDCKL7GI47L5Q',
      secret: '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',
      buckets: {
        mediaCapture: 'growthgift-dev-media-capture'
      },
      region: 'us-west-1'
    }
  };
  return ret;
};