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
    "mandrill": {
      "apiKey": "vwgK43vyRBQYFjXGPXn6_A",
      "username": "luke@growthgift.com"
    }
  };
  return ret;
};