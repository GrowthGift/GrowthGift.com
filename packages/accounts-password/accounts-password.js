AccountsPassword ={};

Meteor.methods({
  lmAccountsPasswordSignupUser: function(userData, params) {
    return AccountsPassword.signupUser(userData, params);
  }
});

if(Meteor.isServer) {
  AccountsPassword.initServer =function(params) {
    var configEmail =Config.email();
    Accounts.emailTemplates.from =configEmail.addresses.contact.email;
    Accounts.emailTemplates.siteName =Config.appInfo().name;

    //reset password
    var formResetPasswordUrl =function(url) {
      var index1 =url.lastIndexOf('/');
      var token =url.slice((index1+1), url.length);
      index1 =url.indexOf('#');
      var host =url.slice(0, index1);
      newUrl =host+'reset-password?token='+token;
      return newUrl;
    };

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
        "<a href='"+url+"'>Click here to reset your password.</a><br />";
      return content;
    };

    //enroll account (sign up new user)
    var formEnrollUrl =function(url) {
      var index1 =url.lastIndexOf('/');
      var token =url.slice((index1+1), url.length);
      index1 =url.indexOf('#');
      var host =url.slice(0, index1);
      newUrl =host+'enroll-account?token='+token;
      return newUrl;
    };
    
    Accounts.emailTemplates.enrollAccount.text =function(user, url) {
      url =formEnrollUrl(url);
      var content ="Hi "+user.profile.name+",\n\n"+
        "To set a password and start using the service, simply click the link below.\n"+
        url+"\n";
      return content; 
    };

    Accounts.emailTemplates.enrollAccount.html =function(user, url) {
      url =formEnrollUrl(url);
      var content ="Hi "+user.profile.name+",<br /><br />"+
        "<a href='"+url+"'>Click here to set a password and start using the service.</a><br />";
      return content;
    };
  }

  //init
  Meteor.startup(function() {
    AccountsPassword.initServer({});
  });
}

/**
@param {Object} userData The data to create a new user with
  @param {String} email
  @param {String} [password] If none set, an enrollment email will be sent out to the email for the user to set their password
  @param {Object} profile At least 'name' should be set
    @param {String} name
*/
AccountsPassword.signupUser =function(userData, params) {
  if(Meteor.isServer) {
    // if(userData.password ===undefined) {
    //   userData.password =lmString.random(20, {type:'readable'});
    // }

    var userId =Accounts.createUser(userData);
    //if no password, send email to have user set password
    if(userData.password ===undefined) {
      Accounts.sendEnrollmentEmail(userId);
    }
  }
};