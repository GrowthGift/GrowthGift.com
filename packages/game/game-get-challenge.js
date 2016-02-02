/**
@param {Object} [nowTime] a moment
*/
ggGame.getCurrentChallenge =function(game, gameRule, nowTime) {
  nowTime =nowTime || msTimezone.curDateTime('moment');
  var ret ={
    gameStarted: false,
    gameEnded: false,
    possibleCompletions: 0,
    currentChallenge: null,
    nextChallenge: null
  };
  if(!game || !gameRule || !gameRule.challenges) {
    return ret;
  }
  var dtFormat =msTimezone.dateTimeFormat;

  var gameStart =moment(game.start, dtFormat).utc();
  if(gameStart >nowTime) {
    ret.nextChallenge =_.extend({}, gameRule.challenges[0], {
      start: gameStart.format(dtFormat),
      end: gameStart.clone().add(gameRule.challenges[0].dueFromStart, 'minutes').format(dtFormat)
    });
    return ret;
  }
  ret.gameStarted =true;
  // Assumes challenges are in order by date (due from start)
  var ii, challenge, curChallengeDue, found=false;
  var lastChallengeDue =gameStart;
  for(ii =0; ii<gameRule.challenges.length; ii++) {
    challenge =gameRule.challenges[ii];
    curChallengeDue =gameStart.clone().add(challenge.dueFromStart, 'minutes');
    if(curChallengeDue >nowTime) {
      ret.currentChallenge =_.extend({}, challenge, {
        start: lastChallengeDue.format(dtFormat),
        end: curChallengeDue.format(dtFormat)
      });
      ret.possibleCompletions =(ii+1);
      if(ii <(gameRule.challenges.length-1) ) {
        ret.nextChallenge =_.extend({}, gameRule.challenges[(ii+1)], {
          start: ret.currentChallenge.end,
          end: gameStart.clone().add(gameRule.challenges[(ii+1)].dueFromStart, 'minutes').format(dtFormat)
        });
      }
      found =true;
      break;
    }
    lastChallengeDue =curChallengeDue;
  }
  if(!found) {
    ret.possibleCompletions =gameRule.challenges.length;
    ret.gameEnded =true;
  }
  return ret;
};

ggGame.getChallengeDueByWeek =function(challenge, weeksFromNow) {
  var minutesPerWeek = 60 * 24 * 7;
  return challenge.dueFromStart + ( weeksFromNow * minutesPerWeek );
};

ggGame.getGameTimeLeft =function(game, gameRule, nowTime) {
  if(!game || !gameRule || !gameRule.challenges) {
    return null;
  }
  var ret ={
    amount: -1,
    unit: 'days'
  };

  nowTime =nowTime || msTimezone.curDateTime('moment');
  var gameStart =moment(game.start, msTimezone.dateTimeFormat).utc();
  // Assume in order with the last due date as the last item in the array
  var lastChallenge =gameRule.challenges[(gameRule.challenges.length-1)];
  var gameEnd =gameStart.clone().add(lastChallenge.dueFromStart, 'minutes');
  // If game already over, stop
  if(nowTime >gameEnd) {
    return ret;
  }
  // If game has not started yet, compute from game start rather than from now
  var startTime =(nowTime > gameStart) ? nowTime : gameStart;
  ret.amount =gameEnd.clone().diff(startTime.clone(), ret.unit);
  return ret;
};

ggGame.getChallengeTotals =function(game, userGames, gameRule, nowTime) {
  nowTime =nowTime || msTimezone.curDateTime('moment');
  var ret ={
    possible: 0,
    possibleAllUsers: 0,
    userCompletions: 0,
    userActions: 0,
    userGoals: 0,
    numUsers: userGames.length
  };
  var userGameIndex;
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, nowTime);
  if(curChallenge.possibleCompletions) {
    ret.possible =curChallenge.possibleCompletions;
    ret.possibleAllUsers =curChallenge.possibleCompletions * ret.numUsers;
  }
  userGames.forEach(function(ug) {
    if(curChallenge.possibleCompletions) {
      if(ug.challenges && ug.challenges.length) {
        ret.userCompletions +=ug.challenges.length;
        ug.challenges.forEach(function(c) {
          if(c.actionCount) {
            ret.userActions +=c.actionCount;
          }
        });
      }
    }
    // get user goal
    userGameIndex =_.findIndex(game.users, 'userId', ug.userId);
    if(userGameIndex >-1 && game.users[userGameIndex].selfGoal) {
      ret.userGoals +=game.users[userGameIndex].selfGoal;
    }
  });
  return ret;
};

/**
Get all the challenges for the game and stuff in the current user's results
for each.
If no userGame, just returns the challenges with a formated time display.
*/
ggGame.getChallengesWithUser =function(game, gameRule, userGame, nowTime, userGameBuddy) {
  nowTime =nowTime || msTimezone.curDateTime('moment');
  var ret ={
    challenges: []
  };
  if(!game || !gameRule || !gameRule.challenges) {
    return ret;
  }
  var dtFormat =msTimezone.dateTimeFormat;

  var gameLeft =ggGame.getGameTimeLeft(game, gameRule, nowTime);
  var daysLeft =( gameLeft.amount > 0 ? ( gameLeft.amount +1 ) : 1 );
  var gameStart =moment(game.start, dtFormat).utc();
  var gameStarted =( nowTime >= gameStart ) ? true : false;
  // Sort both game challenges and user completed challenges by date
  var challenges =_.sortByOrder(gameRule.challenges, ['dueFromStart'], ['asc']);

  var userId =userGame ? userGame.userId : null;
  var gameUser =userGame ? ggGame.getGameUser(game, userId, {}) : null;
  var userSelfGoalPerChallenge =userGame
   ? Math.ceil( gameUser.selfGoal / gameRule.challenges.length ) : 0;
  var userPastTotalActions =ggGame.getUserGamePastTotalActions(userGame, game, gameRule, nowTime);
  var userAdjustedGoalPerChallenge =userGame
   ? Math.ceil( ( gameUser.selfGoal - userPastTotalActions ) / daysLeft ) : 0;
  var userChallenges =( !userGame || !userGame.challenges ) ? []
   : _.sortByOrder(userGame.challenges, ['updatedAt'], ['asc']);

  // Get info for buddy instruction too
  var buddyId =userGameBuddy ? userGameBuddy.userId : null;
  if(buddyId) {
    var gameUserBuddy =ggGame.getGameUser(game, buddyId, {});
    var buddySelfGoalPerChallenge =Math.ceil( gameUserBuddy.selfGoal /
     gameRule.challenges.length );
    var buddyPastTotalActions =ggGame.getUserGamePastTotalActions(
      userGameBuddy, game, gameRule, nowTime);
    var buddyAdjustedGoalPerChallenge =Math.ceil(
     ( gameUserBuddy.selfGoal - buddyPastTotalActions ) / daysLeft );
    var buddyChallenges =( !userGameBuddy.challenges ) ? []
     : _.sortByOrder(userGameBuddy.challenges, ['updatedAt'], ['asc']);
  }

  var userMayViewChallenges =userGame
   ? ggMay.viewUserGameChallenge(game, userId) : false;

  var curChallenge, curChallengeEnd, ii, ucUpdated, uc;
  var challengeEnded, challengeStarted;
  var lastChallengeEnd =gameStart;
  var actionsToDo, actionsToDoBuddy;
  challenges.forEach(function(challenge) {
    curChallengeEnd =gameStart.clone().add(challenge.dueFromStart, 'minutes');
    challengeEnded = ( curChallengeEnd <= nowTime ) ? true : false;
    challengeStarted =( lastChallengeEnd <= nowTime ) ? true : false;
    actionsToDo =( !challengeEnded && userAdjustedGoalPerChallenge > 0 ) ?
     userAdjustedGoalPerChallenge :
     ( ( userSelfGoalPerChallenge > 0 ) ? userSelfGoalPerChallenge : "?" );

    actionsToDoBuddy = !buddyId ? "?" : ( !challengeEnded &&
     buddyAdjustedGoalPerChallenge > 0 ) ? buddyAdjustedGoalPerChallenge :
     ( ( buddySelfGoalPerChallenge > 0 ) ? buddySelfGoalPerChallenge : "?" );

    curChallenge ={
      title: challenge.title,
      description: challenge.description,
      started: challengeStarted,
      ended: challengeEnded,
      start: lastChallengeEnd.format(dtFormat),
      end: curChallengeEnd.format(dtFormat),
      // If challenge has not started, show when it does. If it has started
      // but has NOT ended, show when it ends. If it's already over, show
      // when it ended.
      timePeriod: ( !challengeStarted ) ? 'future'
       : ( challengeStarted && !challengeEnded ) ? 'present' : 'past',
      userSelfGoal: userSelfGoalPerChallenge,
      userActionCount: 0,    // May be updated
      buddyActionCount: 0,    // May be updated
      actionsToDo: actionsToDo,
      actionsToDoBuddy: actionsToDoBuddy,
      // May update if this is the current challenge
      mayUpdate: ( userMayViewChallenges && nowTime >= lastChallengeEnd &&
       nowTime <= curChallengeEnd ) ? true : false,
      instruction: "Do " + actionsToDo + " " + gameRule.mainAction,   // May be updated
      buddyInstruction: ( buddyId || !userGame ) ? ( "Help your buddy do " + actionsToDoBuddy + " " +
       gameRule.mainAction ) : "Choose a buddy",   // May be updated
      userMedia: null,
      buddyMedia: null
    };

    if(userGame) {
      // Get user action count for this challenge (if there is one)
      for(ii =0; ii<userChallenges.length; ii++) {
        uc =userChallenges[ii];
        ucUpdated =moment(uc.updatedAt, dtFormat).utc();
        // If updated between start and end of this challenge, this is it.
        if( ucUpdated >= lastChallengeEnd && ucUpdated <= curChallengeEnd ) {
          curChallenge.userActionCount =uc.actionCount;
          // Update instruction
          curChallenge.instruction = ( ( challengeEnded ) ? ( "You did" ) :
           ( "You've done" ) ) + " " + uc.actionCount + " / " +
           actionsToDo
           + " " + gameRule.mainAction;

          if(uc.media || uc.mediaMessage) {
            curChallenge.userMedia ={
              message: uc.mediaMessage ? uc.mediaMessage : null,
              image: ( uc.media && uc.mediaType === 'image' ) ? uc.media : null,
              video: ( uc.media && uc.mediaType === 'video' ) ? uc.media : null,
              privacy: uc.mediaPrivacy
            };
          }

          break;
        }
        // If updated after this challenge ended, we're already too far, stop
        // (user did NOT complete this challenge).
        else if( ucUpdated > curChallengeEnd ) {
          break;
        }
        // Otherwise (if updated before start), move on to next one
      }
    }

    if(buddyId) {
      // Get user action count for this challenge (if there is one)
      for(ii =0; ii<buddyChallenges.length; ii++) {
        uc =buddyChallenges[ii];
        ucUpdated =moment(uc.updatedAt, dtFormat).utc();
        // If updated between start and end of this challenge, this is it.
        if( ucUpdated >= lastChallengeEnd && ucUpdated <= curChallengeEnd ) {
          curChallenge.buddyActionCount =uc.actionCount;
          // Update instruction
          curChallenge.buddyInstruction = ( ( challengeEnded ) ? ( "Buddy did" ) :
           ( "Buddy has done" ) ) + " " + uc.actionCount + " / " +
           actionsToDoBuddy
           + " " + gameRule.mainAction;

          if(uc.media || uc.mediaMessage) {
            curChallenge.buddyMedia ={
              message: uc.mediaMessage ? uc.mediaMessage : null,
              image: ( uc.media && uc.mediaType === 'image' ) ? uc.media : null,
              video: ( uc.media && uc.mediaType === 'video' ) ? uc.media : null,
              privacy: uc.mediaPrivacy
            };
          }

          break;
        }
        // If updated after this challenge ended, we're already too far, stop
        // (user did NOT complete this challenge).
        else if( ucUpdated > curChallengeEnd ) {
          break;
        }
        // Otherwise (if updated before start), move on to next one
      }
    }

    ret.challenges.push(curChallenge);

    lastChallengeEnd =curChallengeEnd;
  });

  return ret;
}

ggGame.getUserChallengeLog =function(game, gameRule, userGame, nowTime, userGameBuddy, userSelf, userMain, userBuddy) {
  var challenges =ggGame.getChallengesWithUser(game, gameRule, userGame,
   nowTime, userGameBuddy).challenges;
  if( challenges && challenges.length ) {
    // Add in privileges
    var userId =userSelf._id;
    var userIsMain = ( userId && userMain._id === userId ) ? true : false;
    var userIsBuddy = ( userId && userBuddy && userBuddy._id === userId ) ?
     true : false;
    var user =userSelf;
    challenges.forEach(function(challenge, index) {
      challenges[index].privileges ={
        userMainMedia: ( userIsMain || userIsBuddy || ( challenge.userMedia
         && challenge.userMedia.privacy === 'public' ) ) ? true : false,
        userBuddyMedia: ( userIsBuddy || userIsMain || ( challenge.buddyMedia
         && challenge.buddyMedia.privacy === 'public' ) ) ? true : false
      };
      challenges[index].timeDisplay = ( !challenge.started) ?
       ( "Starts " + msUser.toUserTime(user, challenge.start, null, 'from') )
       : ( challenge.started && !challenge.ended) ?
       ( "Ends " + msUser.toUserTime(user, challenge.end, null, 'from') )
       : ( "Ended " + msUser.toUserTime(user, challenge.end, null, 'from') );
    });
  }
  return challenges;
};