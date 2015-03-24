SimpleSchema.debug =true;   //TESTING
Push.debug = true; // Add verbosity

AFTestSchema =new SimpleSchema({
  text1: {
    type: String,
    optional: true
  },
  file1: {
    type: String,
    optional: true
  },
  datetime1: {
    type: String,
    optional: true
  },
  datetime2: {
    type: String,
    optional: true
  }
});

AFTestCollection =new Mongo.Collection("afTest");
AFTestCollection.attachSchema(AFTestSchema);

Push.addListener('message', function(notification) {
  console.log(notification);    //TESTING
  // Called on every message
});

Meteor.methods({
  saveTestDoc: function(doc, docId) {
    console.log(doc); //TESTING

    if(docId) {
      var modifier =doc;
      AFTestCollection.update({_id:docId}, modifier);
    }
    else {
      // check(doc, PropertySchema);    //@todo - add back in
      AFTestSchema.clean(doc);

      AFTestCollection.insert(doc, function(error, result) {
        if(Meteor.isClient) {
          if(!error && result) {
            // console.log('success');
          }
        }
      });
    }
  },
  devTestTestSendPush: function(params) {
    if(Meteor.userId()) {
      console.log('sending push to: '+Meteor.userId());   //TESTING
      if(Meteor.isServer) {
        var badge =Math.floor(Math.random() * 20) + 1;
        lmNotify.sendPush({title: 'dev-test-test push title '+Meteor.userId(), text: 'dev-test-test push text '+Meteor.userId(), badge: badge}, Meteor.userId(), {});
      }
    }
    else {
      console.log('no valid userId - must be logged in to send push notification!');
    }
  },
  devTestTestSendEmail: function(params) {
    var ret ={};
    if(user =Meteor.user()) {
      // Let other method calls from the same client start running,
      // without waiting for the email sending to complete.
      this.unblock();

      var email =user.emails[0].address;
      console.log('sending email to: '+email);   //TESTING
      if(Meteor.isServer) {
        lmNotify.sendEmail({to: [email], subject: 'dev-test-test email subject', html: 'dev-test-test email html' });
      }
    }
    else {
      console.log('no valid userId - must be logged in to send email notification!');
    }
  },
  devTestTestNotify: function(params) {
    var ret ={};
    if(Meteor.userId) {
      this.unblock();   // Let other method calls from the same client start running

      if(Meteor.isServer) {
        lmNotify.send(params.type, {}, {});
      }
    }
    else {
      console.log('no valid userId - must be logged in to send '+params.type+' notification!');
    }
  }
});

//testing
Push.addListener('token', function(token) {
  console.log('Token: ' + JSON.stringify(token));
  // alert('Token: ' + JSON.stringify(token));
});
// if(Meteor.isClient) {
//   Push.id(); // Unified application id - not a token
// }

if(Meteor.isServer) {
  Meteor.publish('current-aftest', function(docId) {
    return AFTestCollection.find({_id: docId});
  });
  Meteor.publish('aftests', function() {
    return AFTestCollection.find({});
  });
  // Meteor.publish('dev-test-test-user', function() {
  //   return UsersCollection.find({'_id': Meteor.userId()}, {});
  // });
}

if(Meteor.isClient) {
  Template.devTestTest.helpers({
    afTest: function() {
      if(this.docId) {
        var doc =AFTestCollection.findOne({_id: this.docId});
        return AFTestCollection.findOne({_id: this.docId});
      }
      else {
        return {}
      }
    },
    afMethod: function() {
      if(this.docId) {
        return 'method-update';
      }
      else {
        return 'method';
      }
    },
    afTests: function() {
      return AFTestCollection.find();
    },
    curVal: function() {
      return JSON.stringify(AFTestCollection.findOne({_id: this.docId}));
    },
    optsDatetimepicker: function() {
      return {
      }
    },
    optsDatetimepickerNoTime: function() {
      return {
        formatValue: 'YYYY-MM-DD',
        pikaday: {
          format: 'MMM D, YYYY',
          showTime: false,
        }
      }
    }
  });

  Template.devTestTest.events({
    'click .dev-test-test-push-btn': function(evt, template) {
      Meteor.call("devTestTestSendPush", {});
    },
    'click .dev-test-test-email-btn': function(evt, template) {
      Meteor.call("devTestTestSendEmail", {});
    },
    'click .dev-test-test-notify-notiftype1-btn': function(evt, template) {
      Meteor.call("devTestTestNotify", {type: 'devTest'});
    },
    'click .dev-test-test-signup-user-btn': function(evt, template) {
      var userData ={
        email: document.getElementById('dev-test-test-signup-user-email').value,    //hardcoded
        profile: {
          name: 'Test '+(Math.random() + 1).toString(36).substring(7)
        }
      };
      Meteor.call("lmAccountsPasswordSignupUser", userData, {});
    }
  });
}