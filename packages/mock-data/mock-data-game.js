var nowTime =ggMockData._nowTime;
var dtFormat =ggMockData._dtFormat;

var games =[
  {
    _id: 'game1',
    gameRuleId: 'gameRule1',
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
  },
  // {
  //   _id: '10000pushups',
  //   "actionGoal": 10000,
  //   "title": "Pushups",
  //   "slug": "pushups",
  //   "privacy": "public",
  //   "start": "2015-12-14 08:00:00+00:00",
  //   "updatedAt": "2015-12-19 07:12:27+00:00",
  //   "users": [
  //     {
  //       "userId": "pushupUser1",
  //       "role": "creator",
  //       "status": "joined",
  //       "buddyRequestKey": "pushupUser1Buddy",
  //       "updatedAt": "2015-12-08 19:40:53+00:00",
  //       "selfGoal": 250
  //     },
  //     {
  //       "userId": "pushupUser2",
  //       "status": "joined",
  //       "buddyRequestKey": "pushupUser2Buddy",
  //       "updatedAt": "2015-12-10 16:19:23+00:00",
  //       "selfGoal": 50
  //     },
  //     {
  //       "userId": "pushupUser3",
  //       "status": "joined",
  //       "buddyRequestKey": "pushupUser3",
  //       "updatedAt": "2015-12-10 19:43:33+00:00",
  //       "selfGoal": 250,
  //       "buddyId": "pushupUserX"
  //     },
  //     {
  //       "userId": "7y78rSsiKw3u6fb47",
  //       "status": "joined",
  //       "buddyRequestKey": "mhiswgn9udi",
  //       "updatedAt": "2015-12-11 17:42:37+00:00",
  //       "selfGoal": 24
  //     },
  //     {
  //       "userId": "Xfw2iAJzhN9YaRvxS",
  //       "status": "joined",
  //       "buddyRequestKey": "yohhqwipb9",
  //       "updatedAt": "2015-12-11 21:21:40+00:00",
  //       "selfGoal": 100
  //     },
  //     {
  //       "userId": "sND9F4xhdcrd36rm2",
  //       "status": "joined",
  //       "buddyRequestKey": "hoyrvd3g14i",
  //       "updatedAt": "2015-12-11 21:30:57+00:00",
  //       "selfGoal": 500,
  //       "buddyId": "ZgpMzmJcxfDS2zmbb"
  //     },
  //     {
  //       "userId": "ZgpMzmJcxfDS2zmbb",
  //       "status": "joined",
  //       "buddyRequestKey": "g0zs7i7ldi",
  //       "updatedAt": "2015-12-11 21:36:51+00:00",
  //       "buddyId": "sND9F4xhdcrd36rm2",
  //       "selfGoal": 150
  //     },
  //     {
  //       "userId": "JuKasR5tFwvFgZnJW",
  //       "status": "joined",
  //       "buddyRequestKey": "3w91eq257b9",
  //       "updatedAt": "2015-12-11 21:43:53+00:00",
  //       "selfGoal": 100
  //     },
  //     {
  //       "userId": "fJEn7MXzHvZyXMQLe",
  //       "status": "joined",
  //       "buddyRequestKey": "m0gvz33di",
  //       "updatedAt": "2015-12-11 21:44:22+00:00"
  //     },
  //     {
  //       "userId": "nDDCEg5EAJHWLNaNm",
  //       "status": "joined",
  //       "buddyRequestKey": "1iug63whfr",
  //       "updatedAt": "2015-12-12 00:54:33+00:00",
  //       "selfGoal": 150
  //     },
  //     {
  //       "userId": "rEbFgch3ow3p95WLs",
  //       "status": "joined",
  //       "buddyRequestKey": "qj2h91nstt9",
  //       "updatedAt": "2015-12-12 18:00:26+00:00",
  //       "selfGoal": 100,
  //       "buddyId": "NXeQuuZ2Br5GSvJHF"
  //     },
  //     {
  //       "userId": "RbmaGNpKtv3Wow3Km",
  //       "status": "joined",
  //       "buddyRequestKey": "yz0absp2e29",
  //       "updatedAt": "2015-12-12 23:25:18+00:00",
  //       "selfGoal": 220
  //     },
  //     {
  //       "userId": "uKofythRtGKG87xBX",
  //       "status": "joined",
  //       "buddyRequestKey": "bdkqae2ke29",
  //       "updatedAt": "2015-12-14 00:52:23+00:00",
  //       "selfGoal": 100
  //     },
  //     {
  //       "userId": "jWnEphe8BRG44XnZP",
  //       "status": "joined",
  //       "buddyRequestKey": "mhlim12lnmi",
  //       "updatedAt": "2015-12-14 17:24:10+00:00",
  //       "selfGoal": 100,
  //       "buddyId": "uuQ2dMsqxM7CgfsBs"
  //     },
  //     {
  //       "userId": "G6eFgxqdYQXiZB35m",
  //       "status": "joined",
  //       "buddyRequestKey": "3fsa52n8kt9",
  //       "updatedAt": "2015-12-14 17:26:30+00:00",
  //       "selfGoal": 100,
  //       "buddyId": "GXpgmww2DtReiaiqC"
  //     },
  //     {
  //       "userId": "3a7AC9G2q7Mw5BLZc",
  //       "status": "joined",
  //       "buddyRequestKey": "topk5w89f6r",
  //       "updatedAt": "2015-12-14 18:00:04+00:00",
  //       "selfGoal": 100
  //     },
  //     {
  //       "userId": "a3KkK8Zut3tSdp8AX",
  //       "status": "joined",
  //       "buddyRequestKey": "2765q5pcik9",
  //       "updatedAt": "2015-12-14 18:14:57+00:00",
  //       "selfGoal": 100
  //     },
  //     {
  //       "userId": "GXpgmww2DtReiaiqC",
  //       "status": "joined",
  //       "buddyRequestKey": "rkgep88semi",
  //       "updatedAt": "2015-12-14 20:24:39+00:00",
  //       "buddyId": "G6eFgxqdYQXiZB35m",
  //       "selfGoal": 20
  //     },
  //     {
  //       "userId": "gXetJHr2dqbCz27nA",
  //       "status": "joined",
  //       "buddyRequestKey": "pcknxo8byb9",
  //       "updatedAt": "2015-12-15 02:01:42+00:00",
  //       "buddyId": "tZKxPPPekC96tLmcF",
  //       "selfGoal": 30
  //     },
  //     {
  //       "userId": "SR2Miq8o6WjRkwjfc",
  //       "status": "joined",
  //       "buddyRequestKey": "6kfr7h3q5mi",
  //       "updatedAt": "2015-12-15 05:45:28+00:00",
  //       "selfGoal": 100
  //     },
  //     {
  //       "userId": "Ha7zPCgB8KsPNNQDi",
  //       "status": "joined",
  //       "buddyRequestKey": "t82pg4uc8fr",
  //       "updatedAt": "2015-12-15 18:51:04+00:00",
  //       "selfGoal": 2500
  //     },
  //     {
  //       "userId": "uuQ2dMsqxM7CgfsBs",
  //       "status": "joined",
  //       "buddyRequestKey": "s11yypbvs4i",
  //       "updatedAt": "2015-12-16 05:04:41+00:00",
  //       "buddyId": "jWnEphe8BRG44XnZP",
  //       "selfGoal": 80
  //     },
  //     {
  //       "userId": "NXeQuuZ2Br5GSvJHF",
  //       "status": "joined",
  //       "buddyRequestKey": "kha1p9icnmi",
  //       "updatedAt": "2015-12-16 14:10:56+00:00",
  //       "buddyId": "rEbFgch3ow3p95WLs",
  //       "selfGoal": 25
  //     }
  //   ],
  //   "createdAt": "2015-12-08 19:40:53+00:00",
  //   "image": "https://pixabay.com/static/uploads/photo/2015/08/14/06/42/push-ups-888024_960_720.jpg"
  // }
];

ggMockData.getGame =function(id) {
  return games[_.findIndex(games, '_id', id)];
};