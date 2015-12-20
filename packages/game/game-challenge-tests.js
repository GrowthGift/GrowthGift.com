// Write your tests here!
// Here is an example.
var dtFormat =msTimezone.dateTimeFormat;
// NOTE: do NOT use dates that go around daylight savings!

Tinytest.add('get current challenge that has not started', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dtFormat);
  var gameRule ={
    _id: 'gameRule1',
    challenges: [
      {
        dueFromStart: 1*24*60
      }
    ]
  };
  var game ={
    _id: 'game1',
    gameRuleId: gameRule._id,
    start: nowTime.clone().add(5, 'days').format(dtFormat)
  };
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, nowTime);
  test.equal(curChallenge.gameStarted, false);
  test.equal(curChallenge.gameEnded, false);
  test.equal(curChallenge.currentChallenge, null);
  test.equal(curChallenge.possibleCompletions, 0);
  test.equal(curChallenge.nextChallenge.start, game.start);
});

Tinytest.add('get current challenge that has ended', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dtFormat);
  var gameRule ={
    _id: 'gameRule1',
    challenges: [
      {
        dueFromStart: 1*24*60
      }
    ]
  };
  var game ={
    _id: 'game1',
    gameRuleId: gameRule._id,
    start: nowTime.clone().subtract(15, 'days').format(dtFormat)
  };
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, nowTime);
  test.equal(curChallenge.gameEnded, true);
  test.equal(curChallenge.gameStarted, true);
  test.equal(curChallenge.currentChallenge, null);
  test.equal(curChallenge.possibleCompletions, gameRule.challenges.length);
  test.equal(curChallenge.nextChallenge, null);
});

Tinytest.add('get current challenge that is running', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dtFormat);
  var gameRule ={
    _id: 'gameRule1',
    challenges: [
      {
        dueFromStart: 1*24*60
      },
      {
        dueFromStart: 2*24*60
      },
      {
        dueFromStart: 3*24*60
      },
      {
        dueFromStart: 4*24*60
      }
    ]
  };
  var game ={
    _id: 'game1',
    gameRuleId: gameRule._id,
    start: nowTime.clone().subtract((1.5*24), 'hours').format(dtFormat)
  };
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, nowTime);
  var curChallengeIndex =1;
  test.equal(curChallenge.gameStarted, true);
  test.equal(curChallenge.gameEnded, false);
  test.equal(curChallenge.currentChallenge.dueFromStart, gameRule.challenges[curChallengeIndex].dueFromStart);
  test.equal(curChallenge.currentChallenge.start, moment(game.start, dtFormat).add(gameRule.challenges[(curChallengeIndex-1)].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(curChallenge.currentChallenge.end, moment(game.start, dtFormat).add(gameRule.challenges[(curChallengeIndex)].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(curChallenge.possibleCompletions, 2);
  test.equal(curChallenge.nextChallenge.start, moment(game.start, dtFormat).add(gameRule.challenges[(curChallengeIndex)].dueFromStart, 'minutes').format(dtFormat));
});

Tinytest.add('get current challenge that is on last challenge', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dtFormat);
  var gameRule ={
    _id: 'gameRule1',
    challenges: [
      {
        dueFromStart: 1*24*60
      },
      {
        dueFromStart: 2*24*60
      },
      {
        dueFromStart: 3*24*60
      },
      {
        dueFromStart: 4*24*60
      }
    ]
  };
  var game ={
    _id: 'game1',
    gameRuleId: gameRule._id,
    start: nowTime.clone().subtract((3.5*24), 'hours').format(dtFormat)
  };
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, nowTime);
  var curChallengeIndex =3;
  test.equal(curChallenge.gameStarted, true);
  test.equal(curChallenge.gameEnded, false);
  test.equal(curChallenge.currentChallenge.dueFromStart, gameRule.challenges[curChallengeIndex].dueFromStart);
  test.equal(curChallenge.currentChallenge.start, moment(game.start, dtFormat).add(gameRule.challenges[(curChallengeIndex-1)].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(curChallenge.currentChallenge.end, moment(game.start, dtFormat).add(gameRule.challenges[(curChallengeIndex)].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(curChallenge.possibleCompletions, gameRule.challenges.length);
  test.equal(curChallenge.nextChallenge, null);
});


Tinytest.add('get current user challenge', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dtFormat);
  var gameId ='game1';
  var userId ='user1';
  var userGame ={
    gameId: gameId,
    userId: userId,
    challenges: [
      {
        actionCount: 1,
        updatedAt: nowTime.format(dtFormat)
      },
      {
        actionCount: 1,
        updatedAt: nowTime.clone().add((1*24), 'hours').format(dtFormat)
      },
      // This one out of order
      {
        actionCount: 1,
        updatedAt: nowTime.clone().add((3*24), 'hours').format(dtFormat)
      },
      {
        actionCount: 1,
        updatedAt: nowTime.clone().add((1*24), 'hours').format(dtFormat)
      }
    ]
  }
  var userChallenge =ggGame.getCurrentUserChallenge(gameId, userId, userGame);
  test.equal(userChallenge.numCompletions, userGame.challenges.length);
  test.equal(userChallenge.mostRecentChallenge, userGame.challenges[2]);
});

Tinytest.add('get challenge totals', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dtFormat);
  var gameRule ={
    _id: 'gameRule1',
    challenges: [
      {
        dueFromStart: 1*24*60
      },
      {
        dueFromStart: 2*24*60
      },
      {
        dueFromStart: 3*24*60
      },
      {
        dueFromStart: 4*24*60
      }
    ]
  };
  var game ={
    _id: 'game1',
    gameRuleId: gameRule._id,
    start: nowTime.clone().subtract((2.5*24), 'hours').format(dtFormat)
  };
  var userGames =[
    {
      gameId: game._id,
      userId: 'user1',
      challenges: [
        {
          actionCount: 1,
          updatedAt: nowTime.clone().subtract((2.4*24), 'hours').format(dtFormat)
        },
        {
          actionCount: 2,
          updatedAt: nowTime.clone().subtract((1.4*24), 'hours').format(dtFormat)
        },
        {
          actionCount: 3,
          updatedAt: nowTime.clone().subtract((0.4*24), 'hours').format(dtFormat)
        }
      ]
    },
    {
      gameId: game._id,
      userId: 'user2',
      challenges: [
        {
          actionCount: 5,
          updatedAt: nowTime.clone().subtract((0.8*24), 'hours').format(dtFormat)
        }
      ]
    }
  ];
  var challengeTotals =ggGame.getChallengeTotals(game, userGames, gameRule, nowTime);
  var numUsers =userGames.length;
  // Game start is 2.5 days back so on the 3rd challenge, so 3 possible
  test.equal(challengeTotals.possible, 3);
  test.equal(challengeTotals.possibleAllUsers, 3*numUsers);
  // User1 3 completions, User2 1 completion = 4 total
  test.equal(challengeTotals.userCompletions, 4);
  test.equal(challengeTotals.numUsers, numUsers);
  // User1 1 + 2 + 3 actions, User2 5 completions = 11 total
  test.equal(challengeTotals.userActions, 11);
});

Tinytest.add('get game users actions and buddy actions', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dtFormat);
  var users =[
    {
      _id: 'user1',
      username: 'user1',
      profile: {
        name: 'User1 One'
      }
    },
    {
      _id: 'user2',
      username: 'user2',
      profile: {
        name: 'User2 Two'
      }
    },
    {
      _id: 'user3',
      username: 'user3',
      profile: {
        name: 'User3 Three'
      }
    },
    {
      _id: 'user4',
      username: 'user4',
      profile: {
        name: 'User4 Four'
      }
    },
    {
      _id: 'user5',
      username: 'user5',
      profile: {
        name: 'User5 Five'
      }
    }
  ];
  var gameRule =ggMockData.getGameRule('gameRule1');
  var game ={
    _id: 'game1',
    gameRuleId: 'gameRule1',
    start: nowTime.clone().subtract((2.5*24), 'hours').format(dtFormat),
    users: [
      {
        userId: 'user1',
        buddyId: 'user2',
        selfGoal: 10,
        reachTeam: [
          {
            userId: 'user3'
          },
          {
            userId: 'user4'
          }
        ]
      },
      {
        userId: 'user2',
        buddyId: 'user1',
        selfGoal: 20,
        reachTeam: [
          {
            userId: 'user5'
          }
        ]
      },
      {
        userId: 'user3',
        buddyId: null,
        selfGoal: 30
      },
      {
        userId: 'user4',
        buddyId: null,
        selfGoal: 15
      },
      {
        userId: 'user5',
        buddyId: null,
        selfGoal: 15
      }
    ]
  };
  var userGames =[
    {
      gameId: game._id,
      userId: 'user1',
      challenges: [
        {
          actionCount: 1
        },
        {
          actionCount: 2
        },
        {
          actionCount: 3
        }
      ]
    },
    {
      gameId: game._id,
      userId: 'user2',
      challenges: [
        {
          actionCount: 5
        }
      ]
    },
    {
      gameId: game._id,
      userId: 'user3',
      challenges: [
        {
          actionCount: 7
        },
        {
          actionCount: 1
        }
      ]
    },
    {
      gameId: game._id,
      userId: 'user4',
      challenges: [
        {
          actionCount: 2
        },
        {
          actionCount: 2
        }
      ]
    },
    {
      gameId: game._id,
      userId: 'user5',
      challenges: [
        {
          actionCount: 2
        }
      ]
    }
  ];
  var buddyUsers =ggGame.getGameUsersStats(userGames, game, users, gameRule, nowTime);
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
  selfPledgePercent =Math.round( 6 / ( completionRatio * game.users[0].selfGoal ) * 100);
  // 5 / (3/5 * 20) * 100 = 41
  buddyPledgePercent =Math.round( 5 / ( completionRatio * game.users[1].selfGoal ) * 100);
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
  selfPledgePercent =Math.round( 8 / ( completionRatio * game.users[2].selfGoal ) * 100);
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
  selfPledgePercent =Math.round( 4 / ( completionRatio * game.users[3].selfGoal ) * 100);
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
  selfPledgePercent =Math.round( 2 / ( completionRatio * game.users[4].selfGoal ) * 100);
  test.equal(buddyUsers[retIndex].user1.profile.name, 'User5 Five');
  test.equal(buddyUsers[retIndex].user2, {});
  test.equal(buddyUsers[retIndex].buddiedNumCompletions, 1);
  test.equal(buddyUsers[retIndex].buddiedPossibleCompletions, possibleCompletionsSolo);
  test.equal(buddyUsers[retIndex].buddiedCompletionPercent, Math.round( 1 / possibleCompletionsSolo * 100 ) );
  test.equal(buddyUsers[retIndex].buddiedPledgePercent, selfPledgePercent);
  // self only
  test.equal(buddyUsers[retIndex].buddiedReachTeamsNumActions, 2);
  test.equal(buddyUsers[retIndex].buddiedTeamSize, 1);


  // do single user version too
  var gameUser =ggGame.getGameUserStats(userGames, game, users, gameRule, 'user1', nowTime);
  selfPledgePercent =Math.round( 6 / ( completionRatio * game.users[0].selfGoal ) * 100);
  // buddy is user2
  buddyPledgePercent =Math.round( 5 / ( completionRatio * game.users[1].selfGoal ) * 100);
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

// TODO - add get awards test(s)
