AccountsPassword ={};

Meteor.methods({
  lmAccountsPasswordSignupUser: function(userData, type, params) {
    return AccountsPassword.signupUser(userData, type, params);
  },
  lmAccountsPasswordResendEnrollmentEmail: function(userData, type, params) {
    return AccountsPassword.resendEnrollmentEmail(userData, type, params);
  }
});

if(Meteor.isServer) {
  AccountsPassword.initServer =function(params) {
    var configEmail =Config.email();
    Accounts.emailTemplates.from =configEmail.addresses.contact.name+" <"+configEmail.addresses.contact.email+">";
    Accounts.emailTemplates.siteName =Config.appInfo().name;

    //reset password
    Accounts.emailTemplates.resetPassword.text =function(user, url) {
      url =AccountsPassword.formResetPasswordUrl(url);
      var content ="Hi "+user.profile.name+",\n\n"+
        "Click this link to reset your password:\n"+
        url+"\n";
      return content; 
    };

    Accounts.emailTemplates.resetPassword.html =function(user, url) {
      url =AccountsPassword.formResetPasswordUrl(url);
      var content ="Hi "+user.profile.name+",<br /><br />"+
        "<a href='"+url+"'>Click here to reset your password.</a><br />";
      return content;
    };

    //[enroll account (sign up new user) is set dynamically right before sending since may have multiple templates]
  }

  AccountsPassword.formResetPasswordUrl =function(url) {
    var index1 =url.lastIndexOf('/');
    var token =url.slice((index1+1), url.length);
    index1 =url.indexOf('#');
    var host =url.slice(0, index1);
    newUrl =host+'reset-password?token='+token;
    return newUrl;
  };

  AccountsPassword.formEnrollUrl =function(url) {
    var index1 =url.lastIndexOf('/');
    var token =url.slice((index1+1), url.length);
    index1 =url.indexOf('#');
    var host =url.slice(0, index1);
    newUrl =host+'enroll-account?token='+token;
    return newUrl;
  };

  /**
  @param {String} [type ='default'] One of 'default'
  @param {Object} [params]
  */
  AccountsPassword.setEnrollAccountEmail =function(type, params) {
    if(type ===undefined) {
      type ='default';
    }
    if(type ==='todoseed') {
      //@todo - set custom templates as needed based on type
    }
    else {
      Accounts.emailTemplates.enrollAccount.text =function(user, url) {
        url =AccountsPassword.formEnrollUrl(url);
        var content ="Hi "+user.profile.name+",\n\n"+
          "To set a password and start using the service, simply click the link below.\n"+
          url+"\n";
        return content; 
      };

      Accounts.emailTemplates.enrollAccount.html =function(user, url) {
        url =AccountsPassword.formEnrollUrl(url);
        var content ="Hi "+user.profile.name+",<br /><br />"+
          "<a href='"+url+"'>Click here to set a password and start using the service.</a><br />";
        return content;
      };
    }
  };

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
@param {String} [type ='default'] One of 'default'
@param {Object} [params]
  @param {Object} [emailParams] Params that are passed through to setEnrollAccountEmail [see there for documentation]
*/
AccountsPassword.signupUser =function(userData, type, params) {
  var ret ={};
  if(Meteor.isServer) {
    if(params ===undefined) {
      params ={};
    }
    // if(userData.password ===undefined) {
    //   userData.password =lmString.random(20, {type:'readable'});
    // }

    var userId =Accounts.createUser(userData);
    ret.userId =userId;
    //if no password, send email to have user set password
    if(userData.password ===undefined) {
      this.setEnrollAccountEmail(type, params.emailParams);
      Accounts.sendEnrollmentEmail(userId);
      console.log("AccountsPassword.signupUser enrollment email sent to: "+userId+" "+userData.email);
    }
  }
  return ret;
};

/**
@param {Object} userData The data to create a new user with
  @param {String} _id
@param {String} [type ='default'] One of 'default', 'loanOfficer', 'borrower'
@param {Object} [params]
  @param {Object} [emailParams] Params that are passed through to setEnrollAccountEmail [see there for documentation]
*/
AccountsPassword.resendEnrollmentEmail =function(userData, type, params) {
  var ret ={};
  if(Meteor.isServer) {
    if(params ===undefined) {
      params ={};
    }
    
    var userId =userData._id;
    this.setEnrollAccountEmail(type, params.emailParams);
    Accounts.sendEnrollmentEmail(userId);
    console.log("AccountsPassword.resendEnrollmentEmail enrollment email sent to: "+userId);
  }
  return ret;
};