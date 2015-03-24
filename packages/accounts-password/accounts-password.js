AccountsPassword ={};

if(Meteor.isServer) {
  AccountsPassword.initServer =function(params) {
    var configEmail =Config.email();
    Accounts.emailTemplates.from =configEmail.addresses.contact.email;
    Accounts.emailTemplates.siteName =Config.appInfo().name;

    var formResetPasswordUrl =function(url) {
      var index1 =url.lastIndexOf('/');
      var token =url.slice((index1+1), url.length);
      index1 =url.indexOf('#');
      var host =url.slice(0, index1);
      newUrl =host+'reset-password?token='+token;
      return newUrl;
    };

    //reset password
    Accounts.emailTemplates.resetPassword.text =function(user, url) {
      url =formResetPasswordUrl(url);
      var content ="Hi "+user.profile.name+",\n\n"+
        "Click this link to reset your password:\n"+
        url+"\n";
      return content; 
    };

    Accounts.emailTemplates.resetPassword.html =function(user, url) {
      url =formResetPasswordUrl(url);
      var content ="Hi "+user.profile.name+",<br /><br />"+
        "<a href='"+url+"'>Click here to reset your password</a><br />";
      return content; 
    };
  }

  //init
  Meteor.startup(function() {
    AccountsPassword.initServer({});
  });
}