/*
@toc
1. common
2. user
0. init collections
*/

SimpleSchema.debug =true;   //TESTING


var autoValCreatedAt =function() {
  if(this.isInsert) {
    return moment().utc().format('YYYY-MM-DD HH:mm:ssZ');
  }
  else if(this.isUpsert) {
    return {$setOnInsert: moment().utc().format('YYYY-MM-DD HH:mm:ssZ')};
  }
  else {
    this.unset();
  }
};


/**
Common
@toc 1.
*/


/**
User
@toc 2.
*/
UserProfileSchema =new SimpleSchema({
  name: {
    type: String,
    optional: true
  },
  timezone: {
    type: String,
    optional: true
  },
  image: {
    type: String,
    optional: true
  },
  gender: {
    type: String,
    optional: true
  }
});

UserSignupSchema = new SimpleSchema({
  email: {
    type: String
  },
  password: {
    type: String
  },
  name: {
    type: String
  }
});

UserLoginSchema = new SimpleSchema({
  email: {
    type: String
  },
  password: {
    type: String
  }
});

UserResetPasswordSchema = new SimpleSchema({
  password: {
    type: String
  }
});


// Notifications
NotificationBulkSchema = new SimpleSchema({
  wait: {
    type: Number
  },
  lastSendAt: {
    type: String,
    optional: true
  },
  messages: {
    type: [ Object ],
    optional: true,
    blackbox: true
  }
});

NotificationSchema = new SimpleSchema({
  userId: {
    type: String
  },
  settings: {
    type: Object,
    blackbox: true
  },
  bulk: {
    type: Object,
    optional: true,
  },
  "bulk.email": {
    type: NotificationBulkSchema,
    optional: true
  },
  "bulk.push": {
    type: NotificationBulkSchema,
    optional: true
  },
  "bulk.sms": {
    type: NotificationBulkSchema,
    optional: true
  },
  messages: {
    type: [ Object ],
    blackbox: true,
    optional: true
  },
  notificationCount: {
    type: Number,
    optional: true
  }
});


//@toc 0.
//collections
// UsersCollection =new Meteor.Collection("users");   //use Meteor.users instead
NotificationsCollection =new Meteor.Collection("notifications");

NotificationsCollection.attachSchema(NotificationSchema);