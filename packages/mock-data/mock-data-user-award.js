var nowTime =ggMockData._nowTime;
var dtFormat =ggMockData._dtFormat;

var userAwards =[
  {
    _id: 'uaUser1',
    userId: 'user1',
    longestGameStreak: 10,
    currentGameStreak: 5,
    lastGameChallengeCompletedAt: nowTime.clone().subtract((0.3*24), 'hours').format(dtFormat),
    biggestReach: {
      amount: 10,
      gameId: 'game1'
    }
  }
];

ggMockData.getUserAward =function(id) {
  return userAwards[_.findIndex(userAwards, '_id', id)];
};