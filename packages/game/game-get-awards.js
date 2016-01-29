/**
@param {Object} params
  @param {Number} [maxVal] A value above which all will be treated the same
  @param {Number} [minVal] Below this value, no award will be given
  @param {[String]} [skipWinners] Array of team id's to skip (NOT award -
   e.g. because they've already won a similar award.).
*/
_ggGame.getAwardWinners =function(usersStats, keyUsers, keyAwards, userId, params) {
  params.maxVal = ( params.maxVal !==undefined ) ? params.maxVal : null;
  params.minVal = ( params.minVal !==undefined ) ? params.minVal : -1;
  var award ={
    winners: [],
    max: -1,
    winner: null,    // (Randomly) select ONE team (if more than one).
    selfUser: null
  };
  var scoreToWin = params.minVal ? params.minVal : -1;
  var ii, len =usersStats.length;
  var max, val, team, keyUsers, keyAwards, pushObj;
  var skipIndex =-1;

  usersStats =_.sortByOrder(usersStats, [keyUsers], ['desc']);
  for(ii = 0; ii < len; ii++) {
    team = usersStats[ii];
    val = team[keyUsers];
    max = award.max;
    // Some can be over a value but want to treat all above that value equally.
    // E.g. pledge percent can be over 100 but want to treat them all the same.
    if( val >= params.minVal && ( val >= max ||
     ( params.maxVal && val >= params.maxVal) ) ) {
      // Do NOT set max if this is a skip winner. But still want to add to
      // winners list to give an individual badge.
      skipIndex = ( params.skipWinners ) ? params.skipWinners.indexOf(team._id)
       : -1;
      if( skipIndex < 0 ) {
        award.max = params.maxVal ? ( ( val > params.maxVal ) ?
         params.maxVal : val ) : val;
      }
      if( val > scoreToWin ) {
        scoreToWin = val;
      }
      pushObj ={
        _id: team._id,
        user1: team.user1,
        user2: team.user2,
        skipWinner: ( skipIndex > -1 ) ? true : false
      };
      pushObj[keyAwards] =val;
      award.winners.push(pushObj);
    }

    // See if self user
    if( userId && ( team.user1._id === userId ||
     ( team.user2 && team.user2._id === userId ) ) ) {
      award.selfUser = {
        userId: userId,
        val: val
      };
    }

    // If no userId, go until get below minVal OR below max AND below maxVal (if set)
    if( !userId && ( val < params.minVal || ( val < max &&
     ( !params.maxVal || val < params.maxVal ) ) ) ) {
      break;
    }
  }

  // Save absolute max since if skipped, the single winner may not be the
  // max value.
  award.scoreToWin =scoreToWin;

  // Remove any skip winners
  var winners =award.winners.filter(function(winner) {
    return ( winner.skipWinner ) ? false : true;
  });

  // Break any ties randomly.
  var winnerIndex =0;
  if( winners.length > 0 ) {
    winnerIndex =Math.floor(Math.random() * (winners.length - 0)) + 0;
    award.winner =winners[winnerIndex];
  }

  return award;
};

/**
Award players for completing pledges, recruiting large teams, making big
 impacts. BUT only if above some minimum threshold (e.g. do not want to
 award a 25% completion if that's the top team). Also, do NOT allow one
 team / player to win everything.
*/
ggGame.getAwards =function(userGames, game, users, gameRule, userId, nowTime) {
  nowTime =nowTime || msTimezone.curDateTime('moment');
  var usersStats =ggGame.getGameUsersStats(userGames, game, users, gameRule, nowTime);
  var awards ={};

  // Have to find max and then save the one or more teams at that max.
  // So will sort by each award type and pull the top one(s). This is O(n)
  // for each award so is performance intensive. However, the order of awards
  // may help since they are related and top teams will likely be near the
  // top in multiple categories.
  var keyUsers, keyAwards;
  var skipWinners =null;

  // Order matters as we will not allow the same team to win all awards.
  // If a team wins pledge percent, they will NOT win completion percent too.
  // If win team num actions, will NOT win team size too.

  // Pledge percent
  keyUsers = 'buddiedPledgePercent';
  keyAwards = 'pledgePercent';
  // Ideally would have minVal around 80 but since percentage drops as soon
  // as the new day starts, one the 2nd day of 5 for example, a perfect 100%
  // person could have 50% because has not done their challenge for the day
  // yet. So set to 50.
  awards[keyAwards] =_ggGame.getAwardWinners(usersStats, keyUsers, keyAwards,
   userId, { maxVal: 100, minVal: 50 });

  // Completion percent
  keyUsers = 'buddiedCompletionPercent';
  keyAwards = 'completionPercent';
  // Ideally would have minVal around 80 but since percentage drops as soon
  // as the new day starts, one the 2nd day of 5 for example, a perfect 100%
  // person could have 50% because has not done their challenge for the day
  // yet. So set to 50.
  skipWinners =awards.pledgePercent.winner ?
   awards.pledgePercent.winner._id : null;
  awards[keyAwards] =_ggGame.getAwardWinners(usersStats, keyUsers, keyAwards,
   userId, { minVal: 50, skipWinners: skipWinners });

  // Reach teams num actions
  keyUsers = 'buddiedReachTeamsNumActions';
  keyAwards = 'reachTeamsNumActions';
  awards[keyAwards] =_ggGame.getAwardWinners(usersStats, keyUsers, keyAwards,
   userId, { minVal: 2 });

  // Team size
  keyUsers = 'buddiedTeamSize';
  keyAwards = 'teamSize';
  // Minimum value of 3 so requires more than just a buddy
  // TEMPORARY: allow minimum of 2 while still getting started?
  skipWinners =awards.reachTeamsNumActions.winner ?
   awards.reachTeamsNumActions.winner._id : null;
  awards[keyAwards] =_ggGame.getAwardWinners(usersStats, keyUsers, keyAwards,
   userId, { minVal: 2, skipWinners: skipWinners });

  return awards;
};

ggGame.getBuddiedUserTeamSize =function(userId, game) {
  var buddiedTeamSize =0;
  var userIndex = _.findIndex(game.users, 'userId', userId);
  var gameUser = ( userIndex > -1 ) ? game.users[userIndex] : null;
  if(!gameUser) {
    return 0;
  }
  buddiedTeamSize++;    // Self
  if(gameUser && gameUser.reachTeam && gameUser.reachTeam.length) {
    buddiedTeamSize += gameUser.reachTeam.length;
  }

  if(gameUser.buddyId) {
    buddiedTeamSize++;
    var buddyUserIndex = _.findIndex(game.users, 'userId', gameUser.buddyId);
    var buddyGameUser = ( buddyUserIndex > -1 ) ? game.users[buddyUserIndex] : null;
    if(buddyGameUser && buddyGameUser.reachTeam && buddyGameUser.reachTeam.length) {
      buddiedTeamSize += buddyGameUser.reachTeam.length;
    }
  }

  return buddiedTeamSize;
}

/**
6 possible awards:
- per game
  - self (non-comparative)
    - perfectPledge: 100+% pledge
    - perfectAttendance: 100% completions
  - comparative
    - biggestImpact
    - biggestReach
- across all games, self
  - biggest reach
  - longest streak
*/
_ggGame.getUserAward =function(award, userId, minVal, valKey) {
  var userAward ={
    earned: false
  };
  var winner, ii;
  if( award.winners && award.winners.length ) {
    for(ii =0; ii < award.winners.length; ii++) {
      winner =award.winners[ii];
      if( winner.user1._id === userId || ( winner.user2 &&
       winner.user2._id === userId) ) {
        if( minVal === undefined || winner[valKey] >= minVal ) {
          userAward =winner;
          userAward.scoreToWin = award.scoreToWin;
          userAward.earned =true;
        }
        break;
      }
    }
  }
  if( award.selfUser && award.selfUser.userId === userId ) {
    userAward.selfUser =award.selfUser;
  }
  userAward.scoreToWin =award.scoreToWin;
  return userAward;
};

ggGame.getUserAwards =function(userGames, game, users, gameRule, userAwards, userId, nowTime) {
  nowTime =nowTime || msTimezone.curDateTime('moment');

  var ret ={
    selfReach: {
      game: ggGame.getBuddiedUserTeamSize(userId, game),
      max: userAwards && userAwards.biggestReach && userAwards.biggestReach.amount || 0
    },
    selfStreak: {
      current: {
        amount: 0
      },
      longest: {
        amount: 0
      }
    }
  };
  if( userAwards && userAwards.weekStreak && userAwards.weekStreak.current
   && userAwards.weekStreak.current.amount !== undefined ) {
    ret.selfStreak.current =userAwards.weekStreak.current;
    if(userAwards.weekStreak.longest && userAwards.weekStreak.longest.amount) {
      ret.selfStreak.longest =userAwards.weekStreak.longest;
    }
  }

  var awards =ggGame.getAwards(userGames, game, users, gameRule, userId, nowTime);
  ret.perfectPledge =_ggGame.getUserAward(awards.pledgePercent, userId, 100, 'pledgePercent');
  ret.perfectAttendance =_ggGame.getUserAward(awards.completionPercent, userId, 100, 'completionPercent');
  ret.biggestImpact =_ggGame.getUserAward(awards.reachTeamsNumActions, userId);
  ret.biggestReach =_ggGame.getUserAward(awards.teamSize, userId);

  return ret;
};

ggGame.getUserAwardsAll =function(userGames, userAward, userId) {
  var weekStreak = ( userAward && userAward.weekStreak ) ? userAward.weekStreak
   : ( { longest: { amount: 0 }, current: { amount: 0} } );
  var biggestReachAll = ( userAward && userAward.biggestReach ) ? userAward.biggestReach
   : ( { amount: 0 } );
  var awards ={
    weekStreak: weekStreak,
    biggestReachAll: biggestReachAll,
    perfectPledge: [],
    perfectAttendance: [],
    biggestImpact: [],
    biggestReach: []
  };
  userGames.forEach(function(ug) {
    if(ug.awards && ug.awards.length) {
      ug.awards.forEach(function(award) {
        awards[award.type].push({
          score: award.score,
          createdAt: award.createdAt,
		  userId: ug.userId,
		  profileName: ug.profileName
        })
      });
    }
  });
  return awards;
};