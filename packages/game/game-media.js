Meteor.methods({
  gameMediaChallengeSave: function(game, userId, challengeMedia, challengeId) {
    if(Meteor.isServer) {
      return ggGame.saveChallengeMedia(game, userId, challengeId, challengeMedia, null);
    }
  }
});

ggGame.challengeMediaUploadAndSave =function(game, userId, challengeId, challengeMedia, callback) {
  if(Meteor.isClient) {
    ggGame.uploadMedia(challengeMedia, function(err, challenge) {
      Meteor.call("gameMediaChallengeSave", game, userId, challenge, challengeId, callback);
    });
  }
};

ggGame.uploadMedia =function(challenge, callback) {
  if(Meteor.isClient) {
    if(!challenge.media) {
      return callback(null, challenge);
    }
    var media = ( challenge.media.type === 'image' && challenge.media.image )
     ? challenge.media.image :
     ( challenge.media.type === 'video' && challenge.media.video ) ?
     challenge.media.video : null;
    if( challenge.media.message ) {
      challenge.mediaMessage =challenge.media.message;
    }
    if( challenge.media.privacy ) {
      challenge.mediaPrivacy =challenge.media.privacy;
    }
    if(!media) {
      delete challenge.media;
      return callback(null, challenge);
    }
    challenge.mediaType =challenge.media.type;
    delete challenge.media;
    S3.upload({
      files: [ media ],
      encoding: 'base64'
    }, function(err, result) {
      if(err) {
        delete challenge.mediaType;
      }
      else {
        challenge.media =result.secure_url;
      }
      callback(null, challenge);
    });
  }
};

/**
Similar to the saveUserGameChallengeNew function but since the media could
 take several seconds to process and load, we save it in the background,
 AFTER the initial save is made, so the frontend still loads fast for the user.
*/
ggGame.saveChallengeMedia =function(game, userId, challengeId, challengeMedia, callback) {
  var userGame =UserGamesCollection.findOne({ gameId:game._id, userId:userId });
  var challengeIndex =_.findIndex(userGame.challenges, 'id', challengeId);
  // Now this could happend BEFORE the challenge insert so may not have
  // the challenge yet.
  // var challenge = ( challengeIndex > -1 ) ? userGame.challenges[challengeIndex] : null;
  if(!userGame) {
    if(Meteor.isClient) {
      nrAlert.alert("User is not in this challenge.");
    }
  }
  else {
    var modifier ={};
    challengeMedia.updatedAt =msTimezone.curDateTime();
    if(!userGame.challenges) {
      modifier ={
        $set: {
          challenges: [ challengeMedia ]
        }
      };
    }
    else {
      if( challengeIndex > -1 ) {
        modifier.$set ={};
        var keys =['media', 'mediaType', 'mediaMessage', 'mediaPrivacy', 'updatedAt'];
        keys.forEach(function(key) {
          if( challengeMedia[key] !== undefined ) {
            modifier.$set["challenges."+challengeIndex+"."+key] =
             challengeMedia[key];
          }
        });
      }
      else {
        modifier ={
          $push: {
            challenges: challengeMedia
          }
        };
      }
    }
    return UserGamesCollection.update({ userId:userId, gameId:game._id }, modifier,
     function (err, result) {
      if(callback) {
        callback(err, result);
      }

      // If buddy motivation, notify buddy
      if(Meteor.isServer && ( challengeMedia.media || challengeMedia.mediaMessage ) ) {
        var gameUserIndex =_.findIndex(game.users, 'userId', userId);
        var gameUser = ( gameUserIndex > -1 ) ? game.users[gameUserIndex] : null;
        var buddyId = gameUser ? gameUser.buddyId : null;
        if( buddyId ) {
          var gameRule =GameRulesCollection.findOne({ _id:game.gameRuleId });
          var user =Meteor.users.findOne({ _id: userId }, { fields: { profile: 1, emails: 1} });
          var notifyUserIds =[ buddyId ];
          lmNotify.send('gameChallengeBuddyMotivation', { game: game,
           gameMainAction: gameRule.mainAction, challenge: challengeMedia,
           user: user, notifyUserIds: notifyUserIds }, {});
        }
      }
    });
  }
};