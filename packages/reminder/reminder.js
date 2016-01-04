ggReminder ={};

/**
Types of game reminders:

- game-challenge-due - once per challenge (day) IF the user has not completed
 their pledge for the challenge / day yet.
- game-join-next-week - once to twice per week if user has not joined a game
 for next week yet.
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
    gameStart =moment(game.start, dtFormat).utc();
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
  var minutesBefore =9 * 60;
  // minutesBefore =10.35 * 60;   // TESTING
  var minutesRange =15;   // Should match how often the cron job is run.
  var dtFormat =msTimezone.dateTimeFormat;
  var dueTime =msTimezone.curDateTime('moment').add(minutesBefore, 'minutes');
  var dueTimeUpper =dueTime.clone().add(minutesRange, 'minutes').format(dtFormat);
  dueTime =dueTime.format(dtFormat);
  var cacheGames =CacheGameCurrentChallengesCollection.find({
   currentChallengeEnd: { $gte: dueTime, $lt: dueTimeUpper } }).fetch();
  console.log(dueTime, dueTimeUpper, msTimezone.curDateTime(), cacheGames);   // TESTING

  var userGames, challengeStart, query;
  var gameUserIndex, gameUser, gameBuddyUser, doneUserIds;
  var mostRecentUserChallenge;
  var user, buddyUser, paramsNotify;
  var game, inspiration;
  cacheGames.forEach(function(cg) {
    // Get current game inspiration, if any.
    inspiration =null;    // Reset
    game =GamesCollection.findOne({ _id: cg.gameId }, { fields: { inspiration:1 } });
    if(game.inspiration && game.inspiration.length) {
      inspiration =ggGame.getMostRecentInspiration(game);
    }


    // Find all users who have not completed this challenge yet.
    // Note this will still get PAST challenges so we still need to double
    // check later if MOST RECENT challenge is before the current challenge
    // start date. I.e. There may be user games returned who have ALREADY
    // completed the challenge and should NOT be notified.
    challengeStart =cg.currentChallengeStart;
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
    userGames =UserGamesCollection.find(query, { fields: { userId:1,
     challenges:1 } }).fetch();

    // Send a reminder to each user who needs to be reminded AND to their buddy.
    doneUserIds =[];    // Reset. This prevent duplicate reminders if their
    // buddy already triggered it.
    userGames.forEach(function(ug) {
      // Need to check if the MOST RECENT challenge is less than the current
      // challenge start date (since the query just looks for ANY challenges).
      // Assume challenges in order with most recent last
      mostRecentChallenge =ug.challenges ? ug.challenges[(ug.challenges.length -1)] : null;
      if(!mostRecentChallenge || ( mostRecentChallenge.updatedAt < challengeStart) ) {
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
              inspiration: inspiration,
              gameMainAction: cg.gameMainAction
            };
            gameUserBuddy =gameUser.buddyId ?
             cg.users[_.findIndex(cg.users, 'userId', gameUser.buddyId)] : null;
            // No need to push self user id as have already gone through this user.
            if(gameUserBuddy) {
              doneUserIds.push(gameUser.buddyId);
              paramsNotify.notifyUserIds.push(gameUser.buddyId);
              buddyUser =Meteor.users.findOne({ _id: gameUser.buddyId },
               { fields: { profile:1 } });
              paramsNotify.buddyUser =buddyUser;
            }

            lmNotify.send('gameChallengeDueReminder', paramsNotify, {});
          }
        }
      }
    });
  });
};

ggReminder.gameJoinNextWeek =function() {
  // Get games that start next week (not this week or 2+ weeks in future).
  var dtFormat =msTimezone.dateTimeFormat;
  var nowTime =msTimezone.curDateTime('moment');
  var nextWeekTime =nowTime.clone().add(5, 'days').format(dtFormat);
  var sundayTime =nowTime.clone().startOf('week');
  // Allow same day, but if past the day, set to next week.
  if(sundayTime.format('YYYY-MM-DD') < nowTime.format('YYYY-MM-DD')) {
    sundayTime =sundayTime.add(7, 'days');
  }
  sundayTime =sundayTime.format(dtFormat);

  var games =GamesCollection.find({ start: { $gte : sundayTime,
   $lte : nextWeekTime } }, { fields: { "users.userId": 1 } }).fetch();

  // Pull out all user ids in a game next week. Everyone ELSE is NOT.
  var userIds =[];
  games.forEach(function(game) {
    game.users.forEach(function(gu) {
      if( userIds.indexOf(gu.userId) < 0 ) {
        userIds.push(gu.userId);
      }
    });
  });

  // Find all users OTHER than the user ids in games.
  var userAward, userId, paramsNotify;
  var paramsNotifyNoStreak ={
    notifyUserIds: [],
    weekStreakCurrent: false
  };
  var paramsNotifyStreak ={
    notifyUserIds: [],
    weekStreakCurrent: true
  };
  var users =Meteor.users.find({ _id: { $nin: userIds } }, { fields:
   { profile: 1 } }).fetch();
  users.forEach(function(user) {
    userId =user._id;
    userAward =UserAwardsCollection.findOne({ userId: userId });
    // Apparently Meteor email will fail if too many emails (simultaneously?)
    // so send just 2 messages with multiple (bcc) recipients - has streak or
    // not.
    // paramsNotify ={
    //   notifyUserIds: [ userId ],
    //   weekStreakCurrent: ( userAward && userAward.weekStreak &&
    //    userAward.weekStreak.current ) ? userAward.weekStreak.current :
    //    ( { amount: 0 } )
    // };
    // lmNotify.send('gameJoinNextWeekReminder', paramsNotify, {});
    if( userAward && userAward.weekStreak && userAward.weekStreak.current
     && userAward.weekStreak.current.amount > 0 ) {
      paramsNotifyStreak.notifyUserIds.push(userId);
    }
    else {
      paramsNotifyNoStreak.notifyUserIds.push(userId);
    }
  });
  if(paramsNotifyStreak.notifyUserIds.length) {
    lmNotify.send('gameJoinNextWeekReminder', paramsNotifyStreak, {});
  }
  if(paramsNotifyNoStreak.notifyUserIds.length) {
    lmNotify.send('gameJoinNextWeekReminder', paramsNotifyNoStreak, {});
  }
};