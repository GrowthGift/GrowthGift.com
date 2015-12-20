var nowTime =ggMockData._nowTime;
var dtFormat =ggMockData._dtFormat;

var games =[
  {
    _id: 'game1',
    // gameRuleId: gameRule._id,
    start: nowTime.clone().subtract((2.5*24), 'hours').format(dtFormat),
    users: [
      {
        userId: 'user1',
        buddyId: 'user2',
        buddyRequestKey: 'user1Buddy',
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
        buddyRequestKey: 'user2Buddy',
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
        buddyRequestKey: 'user3Buddy',
        selfGoal: 30
      },
      {
        userId: 'user4',
        buddyId: null,
        buddyRequestKey: 'user4Buddy',
        selfGoal: 15
      },
      {
        userId: 'user5',
        buddyId: null,
        buddyRequestKey: 'user5Buddy',
        selfGoal: 15
      }
    ]
  },
  {
    _id: 'game2',
    gameRuleId: 'gameRule2',
    start: nowTime.clone().subtract((2.5*24), 'hours').format(dtFormat),
    users: [
      {
        userId: 'user1',
        status: 'joined',
        selfGoal: 100,
        buddyId: 'user2'
      },
      {
        userId: 'user2',
        status: 'joined',
        selfGoal: 50,
        buddyId: 'user1'
      }
    ]
  }
];

ggMockData.getGame =function(id) {
  return games[_.findIndex(games, '_id', id)];
};