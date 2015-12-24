/**
@param {Object} params
  @param {Number} [maxVal] A value above which all will be treated the same
  @param {Number} [minVal] Below this value, no award will be given
  @param {[String]} [skipWinners] Array of team id's to skip (NOT award -
   e.g. because they've already won a similar award.).
*/
_ggGame.getAwardWinners =function(usersStats, keyUsers, keyAwards, params) {
  params.maxVal = ( params.maxVal !==undefined ) ? params.maxVal : null;
  params.minVal = ( params.minVal !==undefined ) ? params.minVal : -1;
  var award ={
    winners: [],
    max: -1,
    winner: null    // (Randomly) select ONE team (if more than one).
  };
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
      pushObj ={
        _id: team._id,
        user1: team.user1,
        user2: team.user2,
        skipWinner: ( skipIndex > -1 ) ? true : false
      };
      pushObj[keyAwards] =val;
      award.winners.push(pushObj);
    }
    // Go until get below minVal OR below max AND below maxVal (if set)
    if( val < params.minVal || ( val < max &&
     ( !params.maxVal || val < params.maxVal ) ) ) {
      break;
    }
  }

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
ggGame.getAwards =function(userGames, game, users, gameRule, nowTime) {
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
   { maxVal: 100, minVal: 50 });

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
   { minVal: 50, skipWinners: skipWinners });

  // Reach teams num actions
  keyUsers = 'buddiedReachTeamsNumActions';
  keyAwards = 'reachTeamsNumActions';
  awards[keyAwards] =_ggGame.getAwardWinners(usersStats, keyUsers, keyAwards,
   { minVal: 2 });

  // Team size
  keyUsers = 'buddiedTeamSize';
  keyAwards = 'teamSize';
  // Minimum value of 3 so requires more than just a buddy
  // TEMPORARY: allow minimum of 2 while still getting started?
  skipWinners =awards.reachTeamsNumActions.winner ?
   awards.reachTeamsNumActions.winner._id : null;
  awards[keyAwards] =_ggGame.getAwardWinners(usersStats, keyUsers, keyAwards,
   { minVal: 2, skipWinners: skipWinners });

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