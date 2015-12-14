var challenges =[
  {
    _id: 'gameRule1',
    mainAction: 'pushups',
    challenges: [
      {
        title: 'title 1',
        description: 'desc 1',
        dueFromStart: 1*24*60
      },
      {
        title: 'title 2',
        description: 'desc 2',
        dueFromStart: 2*24*60
      },
      {
        title: 'title 3',
        description: 'desc 3',
        dueFromStart: 3*24*60
      },
      {
        title: 'title 4',
        description: 'desc 4',
        dueFromStart: 4*24*60
      },
      {
        title: 'title 5',
        description: 'desc 5',
        dueFromStart: 5*24*60
      }
    ]
  }
];

ggMockData.getChallenge =function(type) {
  return challenges[0];
};