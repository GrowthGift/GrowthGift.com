ggGame.saveUserAwardsGameStreak =function(userAward, userId, lastGameChallengeCompletedAt, callback) {
  userAward =userAward || UserAwardsCollection.findOne({ userId: userId });
  var result;
  if(!userAward) {
    userAward ={
      userId: userId,
      longestGameStreak: 1,
      currentGameStreak: 1,
      lastGameChallengeCompletedAt: lastGameChallengeCompletedAt
    };
    // UserAwardsCollection.insert(userAward, function(err, result) {
    //   callback(err, result, userAward);
    // });
    // return;
    result = UserAwardsCollection.insert(userAward);
    return callback(null, result, userAward);
  }
  userAward.longestGameStreak = userAward.longestGameStreak || 0;
  userAward.currentGameStreak = userAward.currentGameStreak || 0;
  // If no last challenge, start streak at 1
  if(!userAward.lastGameChallengeCompletedAt) {
    userAward.currentGameStreak =1;
  }
  else {
    var dtFormat =msTimezone.dateTimeFormat;
    // See if last completion was either yesterday or Friday (if today is
    // Monday), in which case we add to the streak. Otherwise, we reset the
    // streak.
    var todayMoment =moment(lastGameChallengeCompletedAt, dtFormat);
    var lastMoment =moment(userAward.lastGameChallengeCompletedAt, dtFormat);
    var todayDay =todayMoment.day();
    var lastDay =lastMoment.day();
    // It is the next day if one after last time, which is also true if now
    // Sunday (0) and last was Saturday (6) OR if last was Friday (5) and
    // today is Monday (1), since we do not count weekends.
    if( todayDay === (lastDay +1) || todayDay ===0 && lastDay ===6 ||
     todayDay ===1 && lastDay ===5 ) {
      userAward.currentGameStreak++;
    }
    else {
      userAward.currentGameStreak =1;
    }
  }

  if(userAward.currentGameStreak > userAward.longestGameStreak) {
    userAward.longestGameStreak = userAward.currentGameStreak;
  }
  var modifier ={
    $set: {
      longestGameStreak: userAward.longestGameStreak,
      currentGameStreak: userAward.currentGameStreak,
      lastGameChallengeCompletedAt: lastGameChallengeCompletedAt
    }
  };
  // UserAwardsCollection.update({ userId: userId }, modifier, function(err, result) {
  //   callback(err, result, modifier);
  // });
  result =UserAwardsCollection.update({ userId: userId }, modifier);
  return callback(null, result, modifier);
};

ggGame.saveUserAwardsBiggestReach =function(userAward, game, userId, gameId, callback) {
  userAward =userAward || UserAwardsCollection.findOne({ userId: userId });
  game =game || GamesCollection.findOne({ _id: gameId });
  var gameReach = ggGame.getBuddiedUserTeamSize(userId, game);
  var result;
  if(!userAward) {
    userAward ={
      userId: userId,
      biggestReach: {
        amount: gameReach,
        gameId: gameId
      }
    };
    result =UserAwardsCollection.insert(userAward);
    return callback(null, result, userAward);
  }
  if(!userAward.biggestReach || !userAward.biggestReach.amount || userAward.biggestReach.amount < gameReach) {
    var modifier ={
      $set: {
        'biggestReach.amount': gameReach,
        'biggestReach.gameId': gameId
      }
    };
    result =UserAwardsCollection.update({ userId: userId }, modifier);
    return callback(null, result, modifier);
  }
  else {
    return callback(null, null, null);
  }
};

ggGame.saveUserAwards =function(userId, gameId, lastGameChallengeCompletedAt) {
  var userAward = UserAwardsCollection.findOne({ userId: userId });
  var game = GamesCollection.findOne({ _id: gameId });
  ggGame.saveUserAwardsGameStreak(userAward, userId, lastGameChallengeCompletedAt, function() {});
  ggGame.saveUserAwardsBiggestReach(userAward, game, userId, gameId, function() {});
};