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
  var data =ggMockData.getSetGameUser('setGameUser1');
  var userAward ={};
  var retDoc ={
    userId: 'user1'
  };
  ggGame.saveUserAwardsWeekStreak(userAward, data.game, data.userGames[0],
   data.gameRule, retDoc.userId, data.game._id, nowTimeFormat, function(err, result, ret) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(ret.userId, retDoc.userId);
    test.equal(ret.weekStreak.longest.amount, 1);
    test.equal(ret.weekStreak.current.amount, 1);
    test.equal(ret.weekStreak.current.start, nowTimeFormat);
    test.equal(ret.weekStreak.current.last, nowTimeFormat);
  });
});

Tinytest.add('user awards do nothing if not over completion percent and no streak yet', function (test) {
  var data =ggMockData.getSetGameUser('setGameUser1');
  var userAward ={};
  data.userGames[0].challenges =[];
  var retDoc ={
    userId: 'user1'
  };
  ggGame.saveUserAwardsWeekStreak(userAward, data.game, data.userGames[0],
   data.gameRule, retDoc.userId, data.game._id, nowTimeFormat, function(err, result, ret) {
    test.equal(err, null);
    test.equal(result, null);
    test.equal(ret, null);
  });
});

Tinytest.add('user awards end existing streak if not over completion percent', function (test) {
  var data =ggMockData.getSetGameUser('setGameUser1');
  var retDoc ={
    userId: 'user1'
  };
  var userAward ={
    userId: retDoc.userId,
    weekStreak: {
      current: {
        amount: 3,
        last: nowTimeFormat
      },
      longest: {
        amount: 3     // Set to SAME as current so it will be ended too.
      }
    }
  };
  data.userGames[0].challenges =[];
  ggGame.saveUserAwardsWeekStreak(userAward, data.game, data.userGames[0],
   data.gameRule, retDoc.userId, data.game._id, nowTimeFormat, function(err, result, ret) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(ret.$set["weekStreak.longest.end"], userAward.weekStreak.current.last);
    test.equal(ret.$set["weekStreak.current.amount"], 0);
  });
});

Tinytest.add('user awards add to current streak if this is the next week in a row', function (test) {
  var data =ggMockData.getSetGameUser('setGameUser1');
  var retDoc ={
    userId: 'user1'
  };
  ggGame.saveUserAwardsWeekStreak(data.userAwards[0], data.game, data.userGames[0],
   data.gameRule, retDoc.userId, data.game._id, nowTimeFormat, function(err, result, ret) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(ret.$set["weekStreak.current.amount"], 6);
    test.equal(ret.$set["weekStreak.current.last"], nowTimeFormat);
  });
});

Tinytest.add('user awards add to current streak, and longest streak, if the next week in a row', function (test) {
  var data =ggMockData.getSetGameUser('setGameUser1');
  var retDoc ={
    userId: 'user1'
  };
  data.userAwards[0].weekStreak.longest.amount =5;    // Set to SAME as current streak.
  ggGame.saveUserAwardsWeekStreak(data.userAwards[0], data.game, data.userGames[0],
   data.gameRule, retDoc.userId, data.game._id, nowTimeFormat, function(err, result, ret) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(ret.$set["weekStreak.current.amount"], 6);
    test.equal(ret.$set["weekStreak.current.last"], nowTimeFormat);
    test.equal(ret.$set["weekStreak.longest.amount"], 6);
    test.equal(ret.$set["weekStreak.longest.start"], data.userAwards[0].weekStreak.current.start);
  });
});

Tinytest.add('user awards reset streak if missed a week', function (test) {
  var data =ggMockData.getSetGameUser('setGameUser1');
  var retDoc ={
    userId: 'user1'
  };
  var nowTime1Format =nowTime.clone().add(14, 'days').utc().format(dtFormat);
  ggGame.saveUserAwardsWeekStreak(data.userAwards[0], data.game, data.userGames[0],
   data.gameRule, retDoc.userId, data.game._id, nowTime1Format, function(err, result, ret) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(ret.$set["weekStreak.current.amount"], 1);
    test.equal(ret.$set["weekStreak.current.start"], nowTime1Format);
  });
});

Tinytest.add('user awards create new biggest reach if none', function (test) {
  // cleanUp();
  var userAward =null;
  var game =_games[0];
  var retDoc ={
    userId: 'userReach1'
  };
  ggGame.saveUserAwardsBiggestReach(userAward, game, 'userReach1', game._id, function(err, result, ret) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(ret.userId, 'userReach1');
    test.equal(ret.biggestReach.amount, 4);
    test.equal(ret.biggestReach.gameId, game._id);
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
  ggGame.saveUserAwardsBiggestReach(userAward, game, 'userReach1', game._id, function(err, result, ret) {
    test.equal(err, null);
    test.isNotUndefined(result);
    test.equal(ret.$set['biggestReach.amount'], 4);
    test.equal(ret.$set['biggestReach.gameId'], game._id);
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
  ggGame.saveUserAwardsBiggestReach(userAward, game, 'userReach1', game._id, function(err, result, ret) {
    test.equal(err, null);
    test.equal(result, null);
    test.equal(ret, null);
  });
});

Tinytest.add('get game awards', function (test) {
  var data =ggMockData.getSetGameUser('setGameUser1');
  var awards =ggGame.getAwards(data.userGames, data.game,
   data.users, data.gameRule, null, data.nowTime);

  // Game is on 3rd challenge out of 5
  var completionRatio =(3 / 5);
  var possibleCompletionsSolo =3;
  var retIndex, selfPledgePercent, buddyPledgePercent;

  // User 1 & 2 are average of: 6 / 10 * 3/5 = 100, 5 / 20 * 3/5 = 42 so 71
  test.equal(awards.pledgePercent.max, 71);
  test.equal(awards.pledgePercent.winners.length, 1);
  test.equal(awards.pledgePercent.winner.user1.profile.name, 'User1 One');
  test.equal(awards.pledgePercent.winner.user2.profile.name, 'User2 Two');
  test.equal(awards.pledgePercent.scoreToWin, 71);

  // User 3 & 4 are 2/3 = 67. User 1 & 2 are also 67 average
  // (100, 33 = 67) BUT they won pledge percent so should NOT be the
  // single winner here.
  test.equal(awards.completionPercent.max, 67);
  test.equal(awards.completionPercent.winners.length, 3);
  test.notEqual(awards.completionPercent.winner.user1.profile.name, 'User1 One');
  test.equal(awards.completionPercent.winner.user2, {});
  test.equal(awards.completionPercent.scoreToWin, 67);

  // User 1 & 2 have total team actions of 6 + 5 + 8 + 4 + 2 = 25
  test.equal(awards.reachTeamsNumActions.max, 25);
  test.equal(awards.reachTeamsNumActions.winners.length, 1);
  test.equal(awards.reachTeamsNumActions.winner.user1.profile.name, 'User1 One');
  test.equal(awards.reachTeamsNumActions.winner.user2.profile.name, 'User2 Two');
  test.equal(awards.reachTeamsNumActions.scoreToWin, 25);

  // User 1 & 2 have total team size of 1 + 1 + 2 + 1 = 5 BUT already won team
  // actions so should NOT be winners. And since there is a minimum of 2
  // required and no other teams have more than 1, there is NO winner.
  test.equal(awards.teamSize.max, -1);
  test.equal(awards.teamSize.winners.length, 1);
  test.equal(awards.teamSize.winner, null);
  test.equal(awards.teamSize.scoreToWin, 5);
});

Tinytest.add('get game awards for one user', function (test) {
  var data =ggMockData.getSetGameUser('setGameUser1');
  var awards =ggGame.getUserAwards(data.userGames, data.game,
   data.users, data.gameRule, data.userAwards[0], data.userAwards[0].userId,
   nowTime);

  test.equal(awards.selfReach.game, 5);
  test.equal(awards.selfReach.max, 10);
  test.equal(awards.selfStreak.current.amount, 5);
  test.equal(awards.selfStreak.longest.amount, 10);
  test.equal(awards.perfectPledge.earned, false, 'pledge');
  test.equal(awards.perfectAttendance.earned, false, 'attendance');
  test.equal(awards.biggestImpact.earned, true);
  test.equal(awards.biggestImpact.reachTeamsNumActions, 25, 'impact');
  test.equal(awards.biggestImpact.scoreToWin, 25,);
  test.equal(awards.biggestReach.earned, true);
  test.equal(awards.biggestReach.teamSize, 5, 'reach');
  test.equal(awards.biggestReach.scoreToWin, 5);
});