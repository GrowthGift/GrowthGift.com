var nowTime =ggMockData._nowTime;
var dtFormat =ggMockData._dtFormat;

var userAwards =[
  {
    _id: 'uaUser1',
    userId: 'user1',
    weekStreak: {
      longest: {
        amount: 10,
        start: nowTime.clone().subtract((100), 'days').format(dtFormat),
        end: nowTime.clone().subtract((30), 'days').format(dtFormat)
      },
      current: {
        amount: 5,
        start: nowTime.clone().subtract((40), 'days').format(dtFormat),
        last: nowTime.clone().subtract((5), 'days').format(dtFormat),
      }
    },
    biggestReach: {
      amount: 10,
      gameId: 'game1'
    }
  }
];

ggMockData.getUserAward =function(id) {
  return EJSON.clone(userAwards[_.findIndex(userAwards, '_id', id)]);
};