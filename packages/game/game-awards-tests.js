var dtFormat =msTimezone.dateTimeFormat;
var nowTime =ggMockData._nowTime;
var nowTimeFormat =ggMockData._nowTimeFormat;
var _games =[
  {
    _id: 'game1',
    users: [
      {
        userId: 'userReach1',
        buddyId: 'userReach2',
        reachTeam: [
          {
            userId: 'userReach3'
          },
          {
            userId: 'userReach4'
          }
        ]
      },
      {
        userId: 'userReach2',
        buddyId: 'userReach1'
      }
    ]
  }
];

// function cleanUp() {
//   UserAwardsCollection.remove({});
// }

Tinytest.add('user awards create new streak if none', function (test) {
  var userAward =null;
  var retDoc ={
    userId: 'user1'
  };
  ggGame.saveUserAwardsGameStreak(userAward, retDoc.userId, nowTimeFormat, function(err, result, data) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(data.userId, retDoc.userId);
    test.equal(data.currentGameStreak, 1);
    test.equal(data.longestGameStreak, 1);
    test.equal(data.lastGameChallengeCompletedAt, nowTimeFormat);
  });
});

Tinytest.add('user awards add to current streak from Mon to Tue', function (test) {
  lastTime =nowTime.clone().startOf('week');
  lastTime =lastTime.add(1, 'days').utc();    // Start on Monday
  var todayTime =lastTime.clone().add(1, 'days').utc();
  var todayTimeFormat =todayTime.format(dtFormat);
  var userAward ={
    userId: 'user1',
    longestGameStreak: 99,
    currentGameStreak: 3,
    lastGameChallengeCompletedAt: lastTime.format(dtFormat)
  };
  ggGame.saveUserAwardsGameStreak(userAward, userAward.userId, todayTimeFormat, function(err, result, data) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(data.$set.currentGameStreak, 4);
    test.equal(data.$set.longestGameStreak, userAward.longestGameStreak);
    test.equal(data.$set.lastGameChallengeCompletedAt, todayTimeFormat);
  });
});

Tinytest.add('user awards add to current streak, and longest streak, from Fri to Mon', function (test) {
  lastTime =nowTime.clone().startOf('week');
  lastTime =lastTime.subtract(2, 'days').utc();    // Start on Friday
  var todayTime =lastTime.clone().add(3, 'days').utc();   // Monday
  var todayTimeFormat =todayTime.format(dtFormat);
  var userAward ={
    userId: 'user1',
    longestGameStreak: 2,
    currentGameStreak: 3,
    lastGameChallengeCompletedAt: lastTime.format(dtFormat)
  };
  ggGame.saveUserAwardsGameStreak(userAward, userAward.userId, todayTimeFormat, function(err, result, data) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(data.$set.currentGameStreak, 4);
    test.equal(data.$set.longestGameStreak, 4);
    test.equal(data.$set.lastGameChallengeCompletedAt, todayTimeFormat);
  });
});

Tinytest.add('user awards reset streak from Mon to Wed', function (test) {
  lastTime =nowTime.clone().startOf('week');
  lastTime =lastTime.add(1, 'days').utc();    // Start on Monday
  var todayTime =lastTime.clone().add(2, 'days').utc();   // Wednesday
  var todayTimeFormat =todayTime.format(dtFormat);
  var userAward ={
    userId: 'user1',
    longestGameStreak: 99,
    currentGameStreak: 3,
    lastGameChallengeCompletedAt: lastTime.format(dtFormat)
  };
  ggGame.saveUserAwardsGameStreak(userAward, userAward.userId, todayTimeFormat, function(err, result, data) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(data.$set.currentGameStreak, 1);
    test.equal(data.$set.longestGameStreak, userAward.longestGameStreak);
    test.equal(data.$set.lastGameChallengeCompletedAt, todayTimeFormat);
  });
});

Tinytest.add('user awards create new biggest reach if none', function (test) {
  // cleanUp();
  var userAward =null;
  var game =_games[0];
  var retDoc ={
    userId: 'userReach1'
  };
  ggGame.saveUserAwardsBiggestReach(userAward, game, 'userReach1', game._id, function(err, result, data) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(data.userId, 'userReach1');
    test.equal(data.biggestReach.amount, 4);
    test.equal(data.biggestReach.gameId, game._id);
  });
});

Tinytest.add('user awards update if bigger this game', function (test) {
  var userAward ={
    userId: 'userReach1',
    biggestReach: {
      amount: 2
    }
  };
  var game =_games[0];
  var retDoc ={
    userId: 'userReach1'
  };
  ggGame.saveUserAwardsBiggestReach(userAward, game, 'userReach1', game._id, function(err, result, data) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(data.$set['biggestReach.amount'], 4);
    test.equal(data.$set['biggestReach.gameId'], game._id);
  });
});

Tinytest.add('user awards do nothing if not bigger reach than exists', function (test) {
  var userAward ={
    userId: 'userReach1',
    biggestReach: {
      amount: 99
    }
  };
  var game =_games[0];
  var retDoc ={
    userId: 'userReach1'
  };
  ggGame.saveUserAwardsBiggestReach(userAward, game, 'userReach1', game._id, function(err, result, data) {
    test.equal(err, null);
    test.equal(result, null);
    test.equal(data, null);
  });
});