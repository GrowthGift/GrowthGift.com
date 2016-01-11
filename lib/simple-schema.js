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

var autoValUpdatedAt =function() {
  return moment().utc().format('YYYY-MM-DD HH:mm:ssZ');
};

// var slugRegEx =/^[a-zA-Z0-9-]*$/;
var slugRegEx =/^[a-z0-9-]*$/;

// In case of an existing document (on edit), we need the existing document id
// as well and there does not seem to be a way to get that here. So this will
// not work..
// However, this seems to be the ONLY way to get consistent error messages so
// we will lose this consistency from a UI standpoint but can still ensure
// proper validation on submit; we just won't have them on blur.
// var validateSlug =function(self, collectionKey, formNames) {
//   if(Meteor.isClient && self.isSet) {
//     Meteor.call('msSlugValidate', self.value, collectionKey, null, function(err, exists) {
//       if(exists) {
//         formNames.forEach(function(curFormName) {
//           GameSchema.namedContext(curFormName).addInvalidKeys([{name: 'slug', type: 'slugExists'}]);
//         });
//       }
//     });
//   }
// };


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
    optional: true,
    custom: ggValidate.schemaHttpsUrl
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


GameRuleSchema = new SimpleSchema({
  slug: {
    type: String,
    regEx: slugRegEx
    // custom: function() {
    //   validateSlug(this, 'gameRules', ['saveGameRulesForm']);
    // }
  },
  type: {
    type: String
  },
  title: {
    type: String
  },
  mainAction: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  challenges: {
    type: [Object],
    optional: true    // Temporary while auto fill single repeating challenge
  },
  "challenges.$.id": {
    type: String,
    optional: true    // Optional since auto generating
  },
  "challenges.$.title": {
    type: String
  },
  "challenges.$.description": {
    type: String
  },
  "challenges.$.dueFromStart": {
    type: Number,
    optional: true    // Temporary while auto generating
  },
  users: {
    type: [Object],
    optional: true
  },
  "users.$.userId": {
    type: String
  },
  "users.$.role": {
    type: String,
    optional: true
  },
  "users.$.updatedAt": {
    type: String,
    optional: true
  },
  createdAt: {
    type: String,
    autoValue: autoValCreatedAt
  },
  updatedAt: {
    type: String,
    autoValue: autoValUpdatedAt
  }
});

GameInspirationSchema = new SimpleSchema({
  _id: {
    type: String
  },
  userId: {
    type: String
  },
  content: {
    type: String
  },
  type: {
    type: String
  },
  likes: {
    type: [ Object ],
    optional: true
  },
  "likes.$.userId": {
    type: String
  },
  "likes.$.createdAt": {
    type: String,
    optional: true
  },
  createdAt: {
    type: String,
    optional: true
  }
});

GameSchema = new SimpleSchema({
  gameRuleId: {
    type: String
  },
  slug: {
    type: String,
    regEx: slugRegEx
    // custom: function() {
    //   validateSlug(this, 'games', ['saveGameForm']);
    // }
  },
  title: {
    type: String
  },
  image: {
    type: String,
    optional: true,
    custom: ggValidate.schemaHttpsUrl
  },
  actionGoal: {
    type: Number,
    min: 1
  },
  privacy: {
    type: String
  },
  start: {
    type: String
  },
  end: {
    type: String,
    optional: true    // auto set
  },
  users: {
    type: [Object],
    optional: true
  },
  "users.$.userId": {
    type: String
  },
  "users.$.status": {
    type: String
  },
  "users.$.role": {
    type: String,
    optional: true
  },
  "users.$.updatedAt": {
    type: String,
    optional: true
  },
  "users.$.buddyId": {
    type: String,
    optional: true
  },
  "users.$.buddyRequestKey": {
    type: String,
    optional: true
  },
  "users.$.reachTeam": {
    type: [ Object ],
    optional: true,
    blackbox: true
  },
  "users.$.selfGoal": {
    type: Number,
    optional: true
  },
  "users.$.feedback": {
    type: [ Object ],
    optional: true,
    blackbox: true
  },
  inspiration: {
    type: [ GameInspirationSchema ],
    optional: true
  },
  createdAt: {
    type: String,
    autoValue: autoValCreatedAt
  },
  updatedAt: {
    type: String,
    autoValue: autoValUpdatedAt
  }
});

GameChallengeSchema = new SimpleSchema({
  id: {
    type: String,
    optional: true    // required but set manually..
  },
  actionCount: {
    type: Number,
    min: 1
  },
  description: {
    type: String,
    optional: true
  },
  privacy: {
    type: String
  },
  media: {
    type: String,
    optional: true
  },
  mediaType: {
    type: String,
    optional: true
  },
  mediaMessage: {
    type: String,
    optional: true
  },
  updatedAt: {
    type: String,
    optional: true,   // If can not auto set, need to make optional to pass validation..
    // autoValue: autoValUpdatedAt    // Not working? And leading to validation error? Just set manually.
  }
});

UserGameSchema = new SimpleSchema({
  userId: {
    type: String
  },
  gameId: {
    type: String
  },
  challenges: {
    type: [GameChallengeSchema],
    optional: true
  },
  awards: {
    type: [ Object ],
    optional: true,
    blackbox: true
  },
  createdAt: {
    type: String,
    optional: true,    // Have to set to optional for challenge updates..
    // TODO - fix this. Should be able to have different validation for (partial) updates.
    autoValue: autoValCreatedAt
  }
});

UserAwardSchema = new SimpleSchema({
  userId: {
    type: String
  },
  weekStreak: {
    type: Object,
    optional: true,
    blackbox: true
  },
  biggestReach: {
    type: Object,
    optional: true
  },
  "biggestReach.amount": {
    type: Number
  },
  "biggestReach.gameId": {
    type: String
  },
  createdAt: {
    type: String,
    autoValue: autoValCreatedAt
  },
  updatedAt: {
    type: String,
    autoValue: autoValUpdatedAt
  }
});


//@toc 0.
//collections
// UsersCollection =new Meteor.Collection("users");   //use Meteor.users instead
NotificationsCollection =new Meteor.Collection("notifications");
NotificationsCollection.attachSchema(NotificationSchema);

// FriendsCollection =new Meteor.Collection("friends");

GameRulesCollection =new Meteor.Collection("gameRules");
GamesCollection =new Meteor.Collection("games");
UserGamesCollection =new Meteor.Collection("userGames");
UserAwardsCollection =new Meteor.Collection("userAwards");

GameRulesCollection.attachSchema(GameRuleSchema);
GamesCollection.attachSchema(GameSchema);
UserGamesCollection.attachSchema(UserGameSchema);
UserAwardsCollection.attachSchema(UserAwardSchema);

// No schema
CacheGameCurrentChallengesCollection =new Meteor.Collection("cacheGameCurrentChallenges");


// Custom validation
SimpleSchema.messages({
  slugExists: "[value] already exists",
  videoYoutube: "Youtube video links only please",
  httpsUrl: "https urls only please",
  regEx: [
    // Setting just ONE regEx (or even regEx schemaKey) overrides ALL regEx
    // so need to redefine defaults here.. Should be able to extend defaults..
    {msg: "[label] failed regular expression validation"},
    {exp: SimpleSchema.RegEx.Email, msg: "[label] must be a valid e-mail address"},
    {exp: SimpleSchema.RegEx.WeakEmail, msg: "[label] must be a valid e-mail address"},
    {exp: SimpleSchema.RegEx.Domain, msg: "[label] must be a valid domain"},
    {exp: SimpleSchema.RegEx.WeakDomain, msg: "[label] must be a valid domain"},
    {exp: SimpleSchema.RegEx.IP, msg: "[label] must be a valid IPv4 or IPv6 address"},
    {exp: SimpleSchema.RegEx.IPv4, msg: "[label] must be a valid IPv4 address"},
    {exp: SimpleSchema.RegEx.IPv6, msg: "[label] must be a valid IPv6 address"},
    {exp: SimpleSchema.RegEx.Url, msg: "[label] must be a valid URL"},
    {exp: SimpleSchema.RegEx.Id, msg: "[label] must be a valid alphanumeric ID"},
    // Custom
    { exp: slugRegEx, msg: "[label] must be lowercase alphanumeric and hyphen characters only"}
  ]
});
