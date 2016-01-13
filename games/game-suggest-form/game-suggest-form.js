GameSuggestFormSchema = new SimpleSchema({
  email: {
    type: String
  },
  gameMainAction: {
    type: String
  },
  gameInstructions: {
    type: String
  },
  other: {
    type: String,
    optional: true
  }
});

Meteor.methods({
  gameSuggestFormSubmit: function(emailBody, replyTo) {
    if(Meteor.isServer) {
      var cfgEmail =Config.email();
      cfgEmail.addresses.hi.email ="hi@growthgift.com";   // TESTING
      lmNotify.sendEmail({to: [ cfgEmail.addresses.hi.email ],
       from: cfgEmail.appName + " Form Submission <automated@" + cfgEmail.emailDomain +">",
       replyTo: [ replyTo ],
       subject: 'Game Suggest Form Submission', html: emailBody });
    }
    if(Meteor.isClient) {
      history.back();
    }
  }
});

if(Meteor.isClient) {
  AutoForm.hooks({
    gameSuggestForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;
        //without this, the Meteor.call line submits the form..
        this.event.preventDefault();
        this.event.stopPropagation();

        var emailBody = "name: " +
         ( Meteor.userId() ? Meteor.user().profile.name : "" ) + "<br />" +
         "email: " + insertDoc.email + "<br />" +
         "gameMainAction: " + insertDoc.gameMainAction + "<br />" +
         "gameInstructions: " + insertDoc.gameInstructions + "<br />" +
         "other: " + ( insertDoc.other || "" ) + "<br />" +
         "timestamp: " + msTimezone.curDateTime();
        Meteor.call("gameSuggestFormSubmit", emailBody, insertDoc.email);

        this.done();
        return false;
      }
    }
  });

  Template.gameSuggestForm.helpers({
    data: function() {
      var ret ={
        email: Meteor.userId() ? Meteor.user().emails[0].address : ''
      };
      return ret;
    }
  });
}