ggGame.getUserGameChallenges =function(gameId, userId) {
  if(!gameId || !userId) {
    return [];
  }
  var userGame =ggGame.getUserGame(gameId, userId);
  if(!userGame || !userGame.challenges) {
    return [];
  }
  return _.sortByOrder(userGame.challenges.map(function(challenge) {
    return _.extend({}, challenge, {
      xDisplay: {
        createdAt: moment(challenge.createdAt, ggConstants.dateTimeFormat).fromNow()
      }
    });
  }), ['createdAt'], ['desc']);
};

ggGame.saveUserGameChallenge =function(game, userId, challenge) {
  var valid =ggMay.addUserGameChallenge(game, userId, {});
  if(!valid) {
    if(Meteor.isClient) {
      nrAlert.alert("You may not add a challenge completion right now. Please try again once the next challenge starts!");
    }
  }
  else {
    var userGame =ggGame.getUserGame(game._id, userId);
    if(!userGame) {
      if(Meteor.isClient) {
        nrAlert.alert("User is not in this game; join the game first.");
      }
    }
    else {
      var modifier ={};
      challenge.createdAt =ggConstants.curDateTime();
      if(!userGame.challenges) {
        modifier ={
          $set: {
            challenges: [ challenge ]
          }
        };
      }
      else {
        modifier ={
          $push: {
            challenges: {
              $each: [ challenge ]
            }
          }
        };
      }

      UserGamesCollection.update({ userId:userId, gameId:game._id }, modifier,
       function (err, result) {
        // console.info('ggGame.saveUserGameChallenge UserGamesCollection.update', challenge, modifier, userId, game._id);
      });
    }
  }
};

ggGame.getCurrentChallenge =function(gameId) {
  var now =moment();
};