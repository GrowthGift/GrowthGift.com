Config.email =function(params) {
  var appName ='todoseedDev';
  var emailDomain ='todoseeddev.meteor.com';
  if(Config.ENV ==='prod') {
    appName ='todoseed';
    emailDomain ='todoseed.meteor.com';
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
      "username": "todoseed",
      "password": "todoseed"
    }
  };
  return ret;
};