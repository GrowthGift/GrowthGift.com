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

function cleanUp() {
  UserAwardsCollection.remove({});
}

Tinytest.add('user awards create new streak if none', function (test) {
  // cleanUp();
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

Tinytest.add('get game awards', function (test) {
  var data =ggMockData.getSetGameUser('setGameUser1');
  var awards =ggGame.getAwards(data.userGames, data.game,
   data.users, data.gameRule, data.nowTime);

  // Game is on 3rd challenge out of 5
  var completionRatio =(3 / 5);
  var possibleCompletionsSolo =3;
  var retIndex, selfPledgePercent, buddyPledgePercent;

  // User 1 & 2 are average of: 6 / 10 * 3/5 = 100, 5 / 20 * 3/5 = 42 so 71
  test.equal(awards.pledgePercent.max, 71);
  test.equal(awards.pledgePercent.winners.length, 1);
  test.equal(awards.pledgePercent.winner.user1.profile.name, 'User1 One');
  test.equal(awards.pledgePercent.winner.user2.profile.name, 'User2 Two');

  // User 3 & 4 are 2/3 = 67. User 1 & 2 are also 67 average
  // (100, 33 = 67) BUT they won pledge percent so should NOT be the
  // single winner here.
  test.equal(awards.completionPercent.max, 67);
  test.equal(awards.completionPercent.winners.length, 3);
  test.notEqual(awards.completionPercent.winner.user1.profile.name, 'User1 One');
  test.equal(awards.completionPercent.winner.user2, {});

  // User 1 & 2 have total team actions of 6 + 5 + 8 + 4 + 2 = 25
  test.equal(awards.reachTeamsNumActions.max, 25);
  test.equal(awards.reachTeamsNumActions.winners.length, 1);
  test.equal(awards.reachTeamsNumActions.winner.user1.profile.name, 'User1 One');
  test.equal(awards.reachTeamsNumActions.winner.user2.profile.name, 'User2 Two');

  // User 1 & 2 have total team size of 1 + 1 + 2 + 1 = 5 BUT already won team
  // actions so should NOT be winners. And since there is a minimum of 2
  // required and no other teams have more than 1, there is NO winner.
  test.equal(awards.teamSize.max, -1);
  test.equal(awards.teamSize.winners.length, 1);
  test.equal(awards.teamSize.winner, null);
});

Tinytest.add('get game awards for one user', function (test) {
  var data =ggMockData.getSetGameUser('setGameUser1');
  var awards =ggGame.getUserAwards(data.userGames, data.game,
   data.users, data.gameRule, data.userAwards[0], data.userAwards[0].userId,
   nowTime);

  test.equal(awards.selfReach.game, 5);
  test.equal(awards.selfReach.max, 10);
  test.equal(awards.selfStreak.current, 5);
  test.equal(awards.selfStreak.longest, 10);
  test.equal(awards.perfectPledge, false, 'pledge');
  test.equal(awards.perfectAttendance, false, 'attendance');
  test.equal(awards.biggestImpact, true, 'impact');
  test.equal(awards.biggestReach, true, 'reach');
});