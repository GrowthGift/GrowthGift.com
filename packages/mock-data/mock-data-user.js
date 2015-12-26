var users =[
  {
    _id: 'user1',
    username: 'user1',
    profile: {
      name: 'User1 One'
    }
  },
  {
    _id: 'user2',
    username: 'user2',
    profile: {
      name: 'User2 Two'
    }
  },
  {
    _id: 'user3',
    username: 'user3',
    profile: {
      name: 'User3 Three'
    }
  },
  {
    _id: 'user4',
    username: 'user4',
    profile: {
      name: 'User4 Four'
    }
  },
  {
    _id: 'user5',
    username: 'user5',
    profile: {
      name: 'User5 Five'
    }
  }
];


ggMockData.getUser =function(id) {
  return EJSON.clone(users[_.findIndex(users, '_id', id)]);
};