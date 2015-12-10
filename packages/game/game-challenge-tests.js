// Write your tests here!
// Here is an example.
var dateTimeFormat ='YYYY-MM-DD HH:mm:ssZ';
// NOTE: do NOT use dates that go around daylight savings!

Tinytest.add('get current challenge that has not started', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dateTimeFormat);
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
    start: nowTime.clone().add(5, 'days').format(dateTimeFormat)
  };
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, nowTime);
  test.equal(curChallenge.gameStarted, false);
  test.equal(curChallenge.gameEnded, false);
  test.equal(curChallenge.currentChallenge, null);
  test.equal(curChallenge.possibleCompletions, 0);
  test.equal(curChallenge.nextChallenge.start, game.start);
});

Tinytest.add('get current challenge that has ended', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dateTimeFormat);
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
    start: nowTime.clone().subtract(15, 'days').format(dateTimeFormat)
  };
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, nowTime);
  test.equal(curChallenge.gameEnded, true);
  test.equal(curChallenge.gameStarted, true);
  test.equal(curChallenge.currentChallenge, null);
  test.equal(curChallenge.possibleCompletions, gameRule.challenges.length);
  test.equal(curChallenge.nextChallenge, null);
});

Tinytest.add('get current challenge that is running', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dateTimeFormat);
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
    start: nowTime.clone().subtract((1.5*24), 'hours').format(dateTimeFormat)
  };
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, nowTime);
  var curChallengeIndex =1;
  test.equal(curChallenge.gameStarted, true);
  test.equal(curChallenge.gameEnded, false);
  test.equal(curChallenge.currentChallenge.dueFromStart, gameRule.challenges[curChallengeIndex].dueFromStart);
  test.equal(curChallenge.currentChallenge.start, moment(game.start, dateTimeFormat).add(gameRule.challenges[(curChallengeIndex-1)].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(curChallenge.currentChallenge.end, moment(game.start, dateTimeFormat).add(gameRule.challenges[(curChallengeIndex)].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(curChallenge.possibleCompletions, 2);
  test.equal(curChallenge.nextChallenge.start, moment(game.start, dateTimeFormat).add(gameRule.challenges[(curChallengeIndex)].dueFromStart, 'minutes').format(dateTimeFormat));
});

Tinytest.add('get current challenge that is on last challenge', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dateTimeFormat);
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
    start: nowTime.clone().subtract((3.5*24), 'hours').format(dateTimeFormat)
  };
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, nowTime);
  var curChallengeIndex =3;
  test.equal(curChallenge.gameStarted, true);
  test.equal(curChallenge.gameEnded, false);
  test.equal(curChallenge.currentChallenge.dueFromStart, gameRule.challenges[curChallengeIndex].dueFromStart);
  test.equal(curChallenge.currentChallenge.start, moment(game.start, dateTimeFormat).add(gameRule.challenges[(curChallengeIndex-1)].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(curChallenge.currentChallenge.end, moment(game.start, dateTimeFormat).add(gameRule.challenges[(curChallengeIndex)].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(curChallenge.possibleCompletions, gameRule.challenges.length);
  test.equal(curChallenge.nextChallenge, null);
});


Tinytest.add('get current user challenge', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dateTimeFormat);
  var gameId ='game1';
  var userId ='user1';
  var userGame ={
    gameId: gameId,
    userId: userId,
    challenges: [
      {
        actionCount: 1,
        updatedAt: nowTime.format(dateTimeFormat)
      },
      {
        actionCount: 1,
        updatedAt: nowTime.clone().add((1*24), 'hours').format(dateTimeFormat)
      },
      // This one out of order
      {
        actionCount: 1,
        updatedAt: nowTime.clone().add((3*24), 'hours').format(dateTimeFormat)
      },
      {
        actionCount: 1,
        updatedAt: nowTime.clone().add((1*24), 'hours').format(dateTimeFormat)
      }
    ]
  }
  var userChallenge =ggGame.getCurrentUserChallenge(gameId, userId, userGame);
  test.equal(userChallenge.numCompletions, userGame.challenges.length);
  test.equal(userChallenge.mostRecentChallenge, userGame.challenges[2]);
});

Tinytest.add('get challenge totals', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dateTimeFormat);
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
    start: nowTime.clone().subtract((2.5*24), 'hours').format(dateTimeFormat)
  };
  var userGames =[
    {
      gameId: game._id,
      userId: 'user1',
      challenges: [
        {
          actionCount: 1,
          updatedAt: nowTime.clone().subtract((2.4*24), 'hours').format(dateTimeFormat)
        },
        {
          actionCount: 2,
          updatedAt: nowTime.clone().subtract((1.4*24), 'hours').format(dateTimeFormat)
        },
        {
          actionCount: 3,
          updatedAt: nowTime.clone().subtract((0.4*24), 'hours').format(dateTimeFormat)
        }
      ]
    },
    {
      gameId: game._id,
      userId: 'user2',
      challenges: [
        {
          actionCount: 5,
          updatedAt: nowTime.clone().subtract((0.8*24), 'hours').format(dateTimeFormat)
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
  var nowTime =moment('2015-09-01 12:00:00-08:00', dateTimeFormat);
  var users =[
    {
      _id: 'user1',
      username: 'user1',
      profile: {
        name: 'User One'
      }
    },
    {
      _id: 'user2',
      username: 'user2',
      profile: {
        name: 'User Two'
      }
    },
    {
      _id: 'user3',
      username: 'user3',
      profile: {
        name: 'User Three'
      }
    }
  ];
  var game ={
    _id: 'game1',
    users: [
      {
        userId: 'user1',
        buddyId: 'user2'
      },
      {
        userId: 'user2',
        buddyId: 'user1'
      },
      {
        userId: 'user3',
        buddyId: null
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
    }
  ];
  var gameUsers =ggGame.getUserGamesChallenges(userGames, game, users);
  // Should be sorted by num actions, most first: user3 > user1 > user2
  test.equal(gameUsers[0].numActions, 8);
  test.equal(gameUsers[0].numChallenges, 2);
  test.equal(gameUsers[0].info.profile.name, 'User Three');
  test.equal(gameUsers[0].buddyNumActions, 0);

  test.equal(gameUsers[1].numActions, 6);
  test.equal(gameUsers[1].numChallenges, 3);
  test.equal(gameUsers[1].info.profile.name, 'User One');
  test.equal(gameUsers[1].buddyNumActions, 5);

  test.equal(gameUsers[2].numActions, 5);
  test.equal(gameUsers[2].numChallenges, 1);
  test.equal(gameUsers[2].info.profile.name, 'User Two');
  test.equal(gameUsers[2].buddyNumActions, 6);
});
