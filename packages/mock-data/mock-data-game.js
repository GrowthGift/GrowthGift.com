var nowTime =ggMockData._nowTime;
var dtFormat =ggMockData._dtFormat;

var games =[
  {
    _id: 'game1',
    gameRuleId: 'gameRule1',
    start: nowTime.clone().subtract((2.5*24), 'hours').format(dtFormat),
    numWeeks: 1,
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
    numWeeks: 1,
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
  },
  {
    _id: 'game3',
    gameRuleId: 'gameRule2',
    start: nowTime.clone().subtract((2.5*24), 'hours').format(dtFormat),
    numWeeks: 4,
    users: [
      {
        userId: 'user1',
        status: 'joined',
        selfGoal: 100,
        buddyId: 'user2'
      }
    ]
  },

];

ggMockData.getGame =function(id) {
  return EJSON.clone(games[_.findIndex(games, '_id', id)]);
};