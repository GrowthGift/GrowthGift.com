var nowTime =ggMockData._nowTime;
var dtFormat =ggMockData._dtFormat;

var userGames =[
  {
    _id: 'ugGame1User1',
    gameId: 'game1',
    userId: 'user1',
    challenges: [
      {
        actionCount: 1,
        start: nowTime.clone().subtract((2.3*24), 'hours').format(dtFormat)
      },
      {
        actionCount: 2,
        start: nowTime.clone().subtract((1.3*24), 'hours').format(dtFormat)
      },
      {
        actionCount: 3,
        start: nowTime.clone().subtract((0.3*24), 'hours').format(dtFormat)
      }
    ]
  },
  {
    _id: 'ugGame1User2',
    gameId: 'game1',
    userId: 'user2',
    challenges: [
      {
        actionCount: 5,
        start: nowTime.clone().subtract((1.3*24), 'hours').format(dtFormat)
      }
    ]
  },
  {
    _id: 'ugGame1User3',
    gameId: 'game1',
    userId: 'user3',
    challenges: [
      {
        actionCount: 7,
        start: nowTime.clone().subtract((2.3*24), 'hours').format(dtFormat)
      },
      {
        actionCount: 1,
        start: nowTime.clone().subtract((0.3*24), 'hours').format(dtFormat)
      }
    ]
  },
  {
    _id: 'ugGame1User4',
    gameId: 'game1',
    userId: 'user4',
    challenges: [
      {
        actionCount: 2,
        start: nowTime.clone().subtract((2.3*24), 'hours').format(dtFormat)
      },
      {
        actionCount: 2,
        start: nowTime.clone().subtract((1.3*24), 'hours').format(dtFormat)
      }
    ]
  },
  {
    _id: 'ugGame1User5',
    gameId: 'game1',
    userId: 'user5',
    challenges: [
      {
        actionCount: 2,
        start: nowTime.clone().subtract((2.3*24), 'hours').format(dtFormat)
      }
    ]
  }
];

ggMockData.getUserGame =function(id) {
  return EJSON.clone(userGames[_.findIndex(userGames, '_id', id)]);
};