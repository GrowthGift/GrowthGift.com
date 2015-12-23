ggReminder ={};

/**
Types of game reminders:

- game-challenge-due - once per challenge (day) IF the user has not completed
 their pledge for the challenge / day yet.
- game-choose-buddy - every 24 hours if do not have one yet UNTIL game starts,
 at which point the daily challenge reminders will handle this.
- game-started - once, when game starts.
*/

/**
For performance we will create a caching collection for this (i.e. once per
 day) and then just run through that (each minute) to send notifications as
 necessary.
NOTE: Since we cache this, any game, game rule, or user changes (e.g. joining
 a game) that happened since the cache will NOT be updated in the reminders.
*/
ggReminder.formGameChallengeDueCache =function() {
  // First clear out cache, which are only challenges due in the next 24 hours
  CacheGameCurrentChallengesCollection.remove({});

  // Find all games that are currently running
  var nowTimeMoment =msTimezone.curDateTime('moment');
  var dtFormat =msTimezone.dateTimeFormat;
  var nowTime =nowTimeMoment.format(dtFormat);
  var games = GamesCollection.find({ start: { $lte: nowTime }, end: { $gte: nowTime } },
   { fields: { gameRuleId:1, slug:1, title:1, image:1, start:1, end:1,
   "users.userId":1, "users.status":1, "users.buddyId":1, "users.buddyRequestKey":1,
   "users.selfGoal":1 } }).fetch();
  // Get game rules
  var gameRuleIds =[];
  games.forEach(function(game) {
    if(gameRuleIds.indexOf(game.gameRuleId) <0) {
      gameRuleIds.push(game.gameRuleId);
    }
  });
  var gameRules =GameRulesCollection.find({ _id: { $in: gameRuleIds } }).fetch();
  var docs =[];
  var doc;
  var ii, challenge, gameStart, lastChallengeDue;
  var gameRule;

  games.forEach(function(game) {
    gameRule =gameRules[_.findIndex(gameRules, '_id', game.gameRuleId)];
    doc ={
      gameId: game._id,
      gameTitle: game.title,
      gameSlug: game.slug,
      gameMainAction: gameRule.mainAction,
      users: game.users,    // Fields should already be filtered via database query
      createdAt: nowTime
    };
    gameStart =moment(game.start, dtFormat);
    lastChallengeDue =gameStart;
    // Assumes challenges are in order by date (due from start)
    for(ii =0; ii<gameRule.challenges.length; ii++) {
      challenge =gameRule.challenges[ii];
      curChallengeDue =gameStart.clone().add(challenge.dueFromStart, 'minutes');
      if(curChallengeDue >nowTimeMoment) {
        doc.currentChallengeStart = msTimezone.convertToUTC(lastChallengeDue.format(dtFormat), {});
        doc.currentChallengeEnd = msTimezone.convertToUTC(curChallengeDue.format(dtFormat), {});
        break;
      }
      lastChallengeDue =curChallengeDue;
    }
    // Meteor does not have bulk insert?
    // docs.push(doc);
    docs.push(1);
    CacheGameCurrentChallengesCollection.insert(doc);
  });

  console.info("Added " + docs.length + " new cacheGameCurrentChallenges doc(s)");
};

/**
Send a reminder X hours before challenge is due if:
- user has not completed the challenge yet.
- user's buddy has not completed the challenge yet (send the same reminder
 to both the user and the buddy).
*/
ggReminder.gameChallengeDue =function() {
  // Find any challenges that are due X minutes from now, give or take Y
  // minutes, which is often we run this cron job.
  var minutesBefore =12 * 60;
  minutesBefore =10.6 * 60;   // TESTING
  var minutesRange =15;
  var dtFormat =msTimezone.dateTimeFormat;
  var dueTime =msTimezone.curDateTime('moment').add(minutesBefore, 'minutes');
  var dueTimeUpper =dueTime.clone().add(minutesRange, 'minutes').format(dtFormat);
  dueTime =dueTime.format(dtFormat);
  console.log(dueTime, dueTimeUpper, msTimezone.curDateTime());   // TESTING
  var cacheGames =CacheGameCurrentChallengesCollection.find({
   currentChallengeEnd: { $gte: dueTime, $lt: dueTimeUpper } }).fetch();

  var userGames, challengeStart, query;
  var gameUserIndex, gameUser, gameBuddyUser, doneUserIds;
  var user, buddyUser, paramsNotify;
  cacheGames.forEach(function(cg) {
    // Find all users who have not completed this challenge yet.
    challengeStart =cg.currentChallengeStart;
    // db.userGames.find({ gameId: 'L9zRezwmmH4LYyzkS', $or: [ { challenges: { $exists: false } }, { 'challenges.updatedAt': { $lt: '2015-12-23 08:00:00+00:00' } } ] }).pretty();
    query ={
      gameId: cg.gameId,
      $or: [
        {
          challenges: { $exists: false }
        },
        {
          "challenges.updatedAt": {
            $lt: challengeStart
          }
        }
      ]
    }
    userGames =UserGamesCollection.find(query, { fields: { userId:1, challenges:1 } }).fetch();

    // Send a reminder to each user who needs to be reminded AND to their buddy.
    doneUserIds =[];    // Reset. This prevent duplicate reminders if their
    // buddy already triggered it.
    userGames.forEach(function(ug) {
      if(doneUserIds.indexOf(ug.userId) <0) {
        // May NOT have a valid user if user joined since the cached data was
        // created.
        gameUserIndex =_.findIndex(cg.users, 'userId', ug.userId);
        gameUser = ( gameUserIndex > -1 ) ? cg.users[gameUserIndex] : null;
        if(gameUser) {
          paramsNotify ={
            notifyUserIds: [ ug.userId ],
            game: {
              title: cg.gameTitle,
              slug: cg.gameSlug
            },
            gameMainAction: cg.gameMainAction
          };
          gameUserBuddy =gameUser.buddyId ?
           cg.users[_.findIndex(cg.users, 'userId', gameUser.buddyId)] : null;
          // No need to push self user id as have already gone through this user.
          if(gameUserBuddy) {
            doneUserIds.push(gameUser.buddyId);
            paramsNotify.notifyUserIds.push(gameUser.buddyId);
            buddyUser =Meteor.users.findOne({ _id: gameUser.buddyId }, { fields: { profile:1 } });
            paramsNotify.buddyUser =buddyUser;
          }

          lmNotify.send('gameChallengeDueReminder', paramsNotify, {});
        }
      }
    });
  });
};

// ggReminder.gameStart =function() {
// };