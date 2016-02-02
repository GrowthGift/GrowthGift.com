var dtFormat =msTimezone.dateTimeFormat;
var nowTime =ggMockData._nowTime;
var nowTimeFormat =ggMockData._nowTimeFormat;
// NOTE: do NOT use dates that go around daylight savings!

Tinytest.add('get game users actions and buddy actions', function (test) {
  var data =ggMockData.getSetGameUser('setGameUser1');
  var buddyUsers =ggGame.getGameUsersStats(data.userGames, data.game,
   data.users, data.gameRule, data.nowTime);
  // buddyUsers =_.sortByOrder(buddyUsers, ['reachTeamNumActions'], ['desc']);
  // Game is on 3rd challenge out of 5
  var completionRatio =(3 / 5);
  var possibleCompletionsSolo =3;
  var retIndex, selfPledgePercent, buddyPledgePercent;

  // user 1 and user 2 should be joined as buddies.
  test.equal(buddyUsers.length, 4);

  // Should be ordered by passed in order, with first buddy user being the one used
  // buddy users 1 & 2
  retIndex =0;
  // 6 / (3/5 * 10) * 100 = 100
  selfPledgePercent =Math.round( 6 / ( completionRatio * data.game.users[0].selfGoal ) * 100);
  // 5 / (3/5 * 20) * 100 = 41
  buddyPledgePercent =Math.round( 5 / ( completionRatio * data.game.users[1].selfGoal ) * 100);
  test.equal(buddyUsers[retIndex].user1.profile.name, 'User1 One');
  test.equal(buddyUsers[retIndex].user2.profile.name, 'User2 Two');
  test.equal(buddyUsers[retIndex].buddiedNumCompletions, 4);
  test.equal(buddyUsers[retIndex].buddiedPossibleCompletions, (possibleCompletionsSolo * 2));
  test.equal(buddyUsers[retIndex].buddiedCompletionPercent,
   Math.round( 4 / (possibleCompletionsSolo * 2 ) * 100 ), 'buddiedCompletionPercent user1 & 2' );
  test.equal(buddyUsers[retIndex].buddiedPledgePercent, ( Math.round (
   ( selfPledgePercent + buddyPledgePercent ) / 2 ) ) );
  // 6 (user 1) + 5 (user 2) + (8 + 4) (user 1's reach team user 3 & 4)
  // + 2 (user 2's reach team user 5) = 25
  test.equal(buddyUsers[retIndex].buddiedReachTeamsNumActions, 25);
  test.equal(buddyUsers[retIndex].buddiedTeamSize, 5);

  // solo user 3
  retIndex =1;
  // 8 / (3/5 * 30) * 100 = 44
  selfPledgePercent =Math.round( 8 / ( completionRatio * data.game.users[2].selfGoal ) * 100);
  test.equal(buddyUsers[retIndex].user1.profile.name, 'User3 Three');
  test.equal(buddyUsers[retIndex].user2, {});
  test.equal(buddyUsers[retIndex].buddiedNumCompletions, 2);
  test.equal(buddyUsers[retIndex].buddiedPossibleCompletions, possibleCompletionsSolo);
  test.equal(buddyUsers[retIndex].buddiedCompletionPercent, Math.round( 2 / possibleCompletionsSolo * 100 ) );
  test.equal(buddyUsers[retIndex].buddiedPledgePercent, selfPledgePercent);
  // self only
  test.equal(buddyUsers[retIndex].buddiedReachTeamsNumActions, 8);
  test.equal(buddyUsers[retIndex].buddiedTeamSize, 1);

  // solo user 4
  retIndex =2;
  // 4 / (3/5 * 15) * 100 = 44
  selfPledgePercent =Math.round( 4 / ( completionRatio * data.game.users[3].selfGoal ) * 100);
  test.equal(buddyUsers[retIndex].user1.profile.name, 'User4 Four');
  test.equal(buddyUsers[retIndex].user2, {});
  test.equal(buddyUsers[retIndex].buddiedNumCompletions, 2);
  test.equal(buddyUsers[retIndex].buddiedPossibleCompletions, possibleCompletionsSolo);
  test.equal(buddyUsers[retIndex].buddiedCompletionPercent, Math.round( 2 / possibleCompletionsSolo * 100 ) );
  test.equal(buddyUsers[retIndex].buddiedPledgePercent, selfPledgePercent);
  // self only
  test.equal(buddyUsers[retIndex].buddiedReachTeamsNumActions, 4);
  test.equal(buddyUsers[retIndex].buddiedTeamSize, 1);

  // solo user 5
  retIndex =3;
  // 2 / (3/5 * 15) * 100 = 22
  selfPledgePercent =Math.round( 2 / ( completionRatio * data.game.users[4].selfGoal ) * 100);
  test.equal(buddyUsers[retIndex].user1.profile.name, 'User5 Five');
  test.equal(buddyUsers[retIndex].user2, {});
  test.equal(buddyUsers[retIndex].buddiedNumCompletions, 1);
  test.equal(buddyUsers[retIndex].buddiedPossibleCompletions, possibleCompletionsSolo);
  test.equal(buddyUsers[retIndex].buddiedCompletionPercent, Math.round( 1 / possibleCompletionsSolo * 100 ) );
  test.equal(buddyUsers[retIndex].buddiedPledgePercent, selfPledgePercent);
  // self only
  test.equal(buddyUsers[retIndex].buddiedReachTeamsNumActions, 2);
  test.equal(buddyUsers[retIndex].buddiedTeamSize, 1);

});

Tinytest.add('get (single) game user actions and buddy actions', function (test) {
  var data =ggMockData.getSetGameUser('setGameUser1');
  var gameUser =ggGame.getGameUserStats(data.userGames, data.game, data.users,
   data.gameRule, 'user1', data.nowTime);

  // Game is on 3rd challenge out of 5
  var completionRatio =(3 / 5);
  var possibleCompletionsSolo =3;
  var retIndex, selfPledgePercent, buddyPledgePercent;

  selfPledgePercent =Math.round( 6 / ( completionRatio * data.game.users[0].selfGoal ) * 100);
  // buddy is user2
  buddyPledgePercent =Math.round( 5 / ( completionRatio * data.game.users[1].selfGoal ) * 100);
  test.equal(gameUser.numActionsTotals.selfReach, 12);
  test.equal(gameUser.numActionsTotals.buddyReach, 2);
  test.equal(gameUser.selfUser.info.profile.name, 'User1 One');
  test.equal(gameUser.selfUser.pledgePercent, selfPledgePercent);
  test.equal(gameUser.selfUser.numActions, 6);
  test.equal(gameUser.buddyUser.info.profile.name, 'User2 Two');
  test.equal(gameUser.buddyUser.pledgePercent, buddyPledgePercent);
  test.equal(gameUser.buddyUser.numActions, 5);
  test.equal(gameUser.buddiedNumCompletions, 4);
  test.equal(gameUser.buddiedPossibleCompletions, ( possibleCompletionsSolo * 2 ) ) ;
  test.equal(gameUser.buddiedCompletionPercent,
   Math.round( 4 / ( possibleCompletionsSolo * 2 ) * 100 ), 'buddiedCompletionPercent single user 1 & 2' );
  test.equal(gameUser.buddiedPledgePercent, ( Math.round (
   ( selfPledgePercent + buddyPledgePercent ) / 2 ) ) );
  // 6 (user 1) + 5 (user 2) + (8 + 4) (user 1's reach team user 3 & 4)
  // + 2 (user 2's reach team user 5) = 25
  test.equal(gameUser.buddiedReachTeamsNumActions, 25);

  test.equal(gameUser.selfReachUsers.length, 2);
  test.equal(gameUser.selfReachUsers[0].numActions, 8);
  test.equal(gameUser.selfReachUsers[0].info.profile.name, 'User3 Three');
  test.equal(gameUser.selfReachUsers[1].numActions, 4);
  test.equal(gameUser.selfReachUsers[1].info.profile.name, 'User4 Four');
  test.equal(gameUser.buddyReachUsers.length, 1);
  test.equal(gameUser.buddyReachUsers[0].numActions, 2);
  test.equal(gameUser.buddyReachUsers[0].info.profile.name, 'User5 Five');

});

Tinytest.add('get game end with weeks', function (test) {
  var minutesPerWeek = 60 * 24 * 7;
  var game = ggMockData.getGame('game3');
  var gameRule = ggMockData.getGameRule(game.gameRuleId);
  // Want to test forming end.
  if(game.end) {
    delete game.end;
  }

  var lastChallenge =gameRule.challenges[(gameRule.challenges.length-1)];
  var due = lastChallenge.dueFromStart + ( minutesPerWeek * ( game.numWeeks - 1 ) );
  var end = moment(game.start, dtFormat).utc().clone().add(due,
   'minutes').format(msTimezone.dateTimeFormat);
  var gameEnd =ggGame.getGameEnd(game, gameRule);
  test.equal(gameEnd, end);
});