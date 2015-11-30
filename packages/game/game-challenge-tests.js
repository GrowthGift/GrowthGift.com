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
  test.equal(curChallenge.nextChallengeStart, game.start);
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
  test.equal(curChallenge.nextChallengeStart, null);
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
  test.equal(curChallenge.nextChallengeStart, moment(game.start, dateTimeFormat).add(gameRule.challenges[(curChallengeIndex)].dueFromStart, 'minutes').format(dateTimeFormat));
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
  test.equal(curChallenge.nextChallengeStart, null);
});


Tinytest.add('get current user challenge', function (test) {
  var time1 =moment('2015-09-01 12:00:00-08:00', dateTimeFormat);
  var gameId ='game1';
  var userId ='user1';
  var userGame ={
    gameId: gameId,
    userId: userId,
    challenges: [
      {
        createdAt: time1.format(dateTimeFormat)
      },
      {
        createdAt: time1.clone().add((1*24), 'hours').format(dateTimeFormat)
      },
      // This one out of order
      {
        createdAt: time1.clone().add((3*24), 'hours').format(dateTimeFormat)
      },
      {
        createdAt: time1.clone().add((1*24), 'hours').format(dateTimeFormat)
      }
    ]
  }
  var userChallenge =ggGame.getCurrentUserChallenge(gameId, userId, userGame);
  test.equal(userChallenge.numCompletions, userGame.challenges.length);
  test.equal(userChallenge.mostRecentChallenge, userGame.challenges[2]);
});
