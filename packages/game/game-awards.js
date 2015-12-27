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

/**
Saves all users' game awards after the game is over and final. Some awards,
 biggest reach and game streak, have already been saved IF the user completed
 the last challenge, but we'll double check and updated as needed here, in case
 the user did NOT complete the last challenge.
*/
ggGame.saveGameUserAwardsFinal =function() {
  // Get all games in the last X hours (where X = how often the cron job is run).
  var dtFormat =msTimezone.dateTimeFormat;
  var nowTime =msTimezone.curDateTime('moment');
  var lastTime =nowTime.clone().subtract(1, 'hours').format(dtFormat);
  var nowTimeFormat =nowTime.format(dtFormat);
  var games =GamesCollection.find({ end: { $gte: lastTime, $lt: nowTimeFormat } }).fetch();

  var gameRule, userGames, gameUsers, userAwards, userId, awards;
  var atLeastOneAward, modifier;
  var awardTypes =['perfectPledge', 'perfectAttendance', 'biggestImpact', 'biggestReach'];
  games.forEach(function(game) {
    gameRule =GameRulesCollection.findOne({_id: game.gameRuleId});
    userGames =UserGamesCollection.find({ gameId:game._id }).fetch();
    gameUsers =userGames ? ggGame.getGameUsersInfo(userGames) : null;
    if(userGames) {
      userGames.forEach(function(ug) {
        userId =ug.userId;
        userAward =UserAwardsCollection.findOne({ userId: userId });
        // Save user game wide awards
        ggGame.saveUserAwardsBiggestReach(userAward, game, userId, game._id, function() {});
        ggGame.saveUserAwardsWeekStreak(userAward, game, ug, gameRule, userId, game._id, null, function() {});
        // Save game user awards
        awards =ggGame.getUserAwards(userGames, game, gameUsers,
         gameRule, userAward, userId, null);
        atLeastOneAward =false;
        // Should NOT have any awards in this game yet so will just set
        // (overwrite) them.
        modifier ={
          $set : {
            awards: []
          }
        };
        awardTypes.forEach(function(awardType) {
          if(awards[awardType] && awards[awardType].earned) {
            atLeastOneAward =true;
            modifier.$set.awards.push({
              type: awardType,
              score: awards[awardType].selfUser ? awards[awardType].selfUser.val : 0,
              createdAt: nowTimeFormat
            });
          }
        });
        if(atLeastOneAward) {
          console.log(userId, game._id, modifier.$set);   // TESTING
          UserGamesCollection.update({ userId: userId, gameId: game._id}, modifier);
        }
      });
    }
  });
};