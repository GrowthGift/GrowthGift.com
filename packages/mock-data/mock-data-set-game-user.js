var setGameUser =[
  {
    _id: 'setGameUser1',
    nowTime: ggMockData._nowTime,
    users: [
      ggMockData.getUser('user1'),
      ggMockData.getUser('user2'),
      ggMockData.getUser('user3'),
      ggMockData.getUser('user4'),
      ggMockData.getUser('user5')
    ],
    gameRule: ggMockData.getGameRule('gameRule1'),
    game: ggMockData.getGame('game1'),
    userGames: [
      ggMockData.getUserGame('ugGame1User1'),
      ggMockData.getUserGame('ugGame1User2'),
      ggMockData.getUserGame('ugGame1User3'),
      ggMockData.getUserGame('ugGame1User4'),
      ggMockData.getUserGame('ugGame1User5')
    ]
  }
];

ggMockData.getSetGameUser =function(id) {
  return setGameUser[_.findIndex(setGameUser, '_id', id)];
};