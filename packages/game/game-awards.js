_ggGame.awardsEndWeekStreak =function(userAward, modifier) {
  // If were in longest streak, need to end it too.
  if( userAward.weekStreak.current.amount ===
   userAward.weekStreak.longest.amount ) {
    modifier.$set["weekStreak.longest.end"] = userAward.weekStreak.current.last;
  }
  return modifier;
};

ggGame.saveUserAwardsWeekStreak =function(userAward, game, userGame, gameRule, userId, gameId, timestamp, callback) {
  userAward =userAward || UserAwardsCollection.findOne({ userId: userId });
  game =game || GamesCollection.findOne({ _id: gameId });
  userGame =userGame || UserGamesCollection.findOne({ userId: userId, gameId: gameId });
  gameRule =gameRule || GameRulesCollection.findOne({ _id: game.gameRuleId });

  var modifier ={
    $set: {}
  };
  var dtFormat =msTimezone.dateTimeFormat;
  var todayMoment, lastMoment, diffDays;

  var streakMinCompletionPercent = ggConstants.awardsWeekStreakMinCompletionPercent;
  var userNumCompletions = (userGame && userGame.challenges) ?
   userGame.challenges.length : 0;
  var userCompletionPercent = Math.round( userNumCompletions /
   gameRule.challenges.length * 100 );

  // This will not count toward to the streak
  if( userCompletionPercent < streakMinCompletionPercent ) {
    // If no existing streak, nothing to do
    if(!userAward || !userAward.weekStreak || !userAward.weekStreak.current ||
     !userAward.weekStreak.longest ) {
      return callback(null, null, null);
    }

    // End existing streak IF it has been over a week
    todayMoment =moment(timestamp, dtFormat).utc();
    lastMoment =moment(userAward.weekStreak.current.last, dtFormat).utc();
    diffDays =todayMoment.diff(lastMoment, 'days');
    if(diffDays > 5) {
      modifier =_ggGame.awardsEndWeekStreak(userAward, modifier);
      modifier.$set["weekStreak.current.amount"] =0;
      result =UserAwardsCollection.update({ userId: userId }, modifier);
      return callback(null, result, modifier);
    }
    return callback(null, null, null);
  }

  // If made it here, we hit the threshold to create a new streak. BUT we
  // still need to check for an existing streak.
  var result;
  if(!userAward || !userAward.userId || !userAward.weekStreak || !userAward.weekStreak.current ||
   !userAward.weekStreak.longest ) {
    var weekStreak ={
      longest: {
        amount: 1,
        start: timestamp
      },
      current: {
        amount: 1,
        start: timestamp,
        last: timestamp
      }
    };
    if(!userAward || !userAward.userId) {
      userAward ={
        userId: userId,
        weekStreak: weekStreak
      };
      result = UserAwardsCollection.insert(userAward);
      return callback(null, result, userAward);
    }
    else {
      modifier ={
        $set: {
          weekStreak: weekStreak
        }
      };
      result =UserAwardsCollection.update({ userId: userId }, modifier);
      return callback(null, result, modifier);
    }
  }

  userAward.weekStreak.longest.amount = userAward.weekStreak.longest.amount || 0;
  userAward.weekStreak.current.amount = userAward.weekStreak.current.amount || 0;

  // 3 cases:
  // 1. end / reset streak if last completion was NOT within a week (8 days) of now.
  // 2. do nothing if last completion was within a week BUT already added to
  // this streak this week (in another game)
  // 3. add to streak if last completion within a week AND have not already
  // added to the streak this week.
  todayMoment =moment(timestamp, dtFormat).utc();
  lastMoment =moment(userAward.weekStreak.current.last, dtFormat).utc();
  diffDays =todayMoment.diff(lastMoment, 'days');
  if(diffDays <= 8) {
    // If have already added to streak this week, do nothing.
    if(diffDays <= 4) {
      return callback(null, null, null);
    }
    else {
      // Add to streak.
      userAward.weekStreak.current.amount++;
    }
  }
  else {
    // Streak is over - check if need to end longest streak. Must do this
    // BEFORE alter userAward.
    modifier =_ggGame.awardsEndWeekStreak(userAward, modifier);

    // Restart streak.
    userAward.weekStreak.current.amount = 1;
    userAward.weekStreak.current.start =timestamp;
    modifier.$set["weekStreak.current.start"] =timestamp;
  }

  if(userAward.weekStreak.current.amount > userAward.weekStreak.longest.amount) {
    modifier.$set["weekStreak.longest.start"] =userAward.weekStreak.current.start;
    modifier.$set["weekStreak.longest.amount"] =userAward.weekStreak.current.amount;
  }
  modifier.$set["weekStreak.current.amount"] =userAward.weekStreak.current.amount;
  modifier.$set["weekStreak.current.last"] =timestamp;
  result =UserAwardsCollection.update({ userId: userId }, modifier);
  return callback(null, result, modifier);
};

ggGame.saveUserAwardsBiggestReach =function(userAward, game, userId, gameId, callback) {
  userAward =userAward || UserAwardsCollection.findOne({ userId: userId });
  game =game || GamesCollection.findOne({ _id: gameId });
  var gameReach = ggGame.getBuddiedUserTeamSize(userId, game);
  var result;
  var modifier ={};
  if(!userAward || !userAward.userId || !userAward.biggestReach ) {
    var biggestReach ={
      amount: gameReach,
      gameId: gameId
    };
    if(!userAward || !userAward.userId) {
      userAward ={
        userId: userId,
        biggestReach: biggestReach
      };
      result =UserAwardsCollection.insert(userAward);
      return callback(null, result, userAward);
    }
    else {
      modifier ={
        $set: {
          biggestReach: biggestReach
        }
      };
    }
    result =UserAwardsCollection.update({ userId: userId }, modifier);
    return callback(null, result, modifier);
  }
  if(!userAward.biggestReach || !userAward.biggestReach.amount || userAward.biggestReach.amount < gameReach) {
    modifier ={
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

// ggGame.saveUserAwards =function(userId, gameId, lastGameChallengeCompletedAt) {
//   var userAward = UserAwardsCollection.findOne({ userId: userId });
//   var game = GamesCollection.findOne({ _id: gameId });
//   ggGame.saveUserAwardsGameStreak(userAward, userId, lastGameChallengeCompletedAt, function() {});
//   ggGame.saveUserAwardsBiggestReach(userAward, game, userId, gameId, function() {});
// };