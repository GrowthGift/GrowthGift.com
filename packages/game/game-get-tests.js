var dateTimeFormat ='YYYY-MM-DD HH:mm:ssZ';
// NOTE: do NOT use dates that go around daylight savings!

Tinytest.add('get challenges with user info', function (test) {
  var nowTime =moment('2015-09-01 12:00:00-08:00', dateTimeFormat);
  var gameRule ={
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
  };
  var game ={
    _id: 'game1',
    gameRuleId: gameRule._id,
    start: nowTime.clone().subtract((2.5*24), 'hours').format(dateTimeFormat),
    users: [
      {
        userId: 'user1',
        status: 'joined',
        selfGoal: 100
      }
    ]
  };
  var userGames =[
    {
      gameId: game._id,
      userId: 'user1',
      challenges: [
        {
          actionCount: 1,
          updatedAt: nowTime.clone().subtract((2.4*24), 'hours').format(dateTimeFormat)
        },
        {
          actionCount: 2,
          updatedAt: nowTime.clone().subtract((1.4*24), 'hours').format(dateTimeFormat)
        },
        {
          actionCount: 3,
          updatedAt: nowTime.clone().subtract((0.4*24), 'hours').format(dateTimeFormat)
        }
      ]
    }
  ];
  var ret =ggGame.getChallengesWithUser(game, gameRule, userGames[0], nowTime);
  var challenges =ret.challenges;
  var gameStart =moment(game.start, dateTimeFormat);
  var selfGoalPerChallenge =Math.ceil( game.users[0].selfGoal / gameRule.challenges.length );

  var curIndex =0;
  test.equal(challenges[curIndex].title, gameRule.challenges[0].title);
  test.equal(challenges[curIndex].description, gameRule.challenges[0].description);
  test.equal(challenges[curIndex].start, gameStart.format(dateTimeFormat) );
  test.equal(challenges[curIndex].end, gameStart.clone().add(gameRule.challenges[0].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(challenges[curIndex].timeDisplay, "Ended 2 days ago");
  test.equal(challenges[curIndex].userSelfGoal, selfGoalPerChallenge);
  test.equal(challenges[curIndex].userActionCount, 1);
  test.equal(challenges[curIndex].mayUpdate, false);
  test.equal(challenges[curIndex].instruction, "You did 1 / 20 pushups");

  curIndex =1;
  test.equal(challenges[1].title, gameRule.challenges[1].title);
  test.equal(challenges[1].description, gameRule.challenges[1].description);
  test.equal(challenges[1].start, gameStart.clone().add(gameRule.challenges[0].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(challenges[1].end, gameStart.clone().add(gameRule.challenges[1].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(challenges[1].timeDisplay, "Ended 12 hours ago");
  test.equal(challenges[1].userSelfGoal, selfGoalPerChallenge);
  test.equal(challenges[1].userActionCount, 2);
  test.equal(challenges[1].mayUpdate, false);
  test.equal(challenges[curIndex].instruction, "You did 2 / 20 pushups");

  curIndex =2;
  test.equal(challenges[2].title, gameRule.challenges[2].title);
  test.equal(challenges[2].description, gameRule.challenges[2].description);
  test.equal(challenges[2].start, gameStart.clone().add(gameRule.challenges[1].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(challenges[2].end, gameStart.clone().add(gameRule.challenges[2].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(challenges[2].timeDisplay, "Ends in 12 hours");
  test.equal(challenges[2].userSelfGoal, selfGoalPerChallenge);
  test.equal(challenges[2].userActionCount, 3);
  test.equal(challenges[2].mayUpdate, true);
  test.equal(challenges[curIndex].instruction, "You've done 3 / 20 pushups");

  curIndex =3;
  test.equal(challenges[3].title, gameRule.challenges[3].title);
  test.equal(challenges[3].description, gameRule.challenges[3].description);
  test.equal(challenges[3].start, gameStart.clone().add(gameRule.challenges[2].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(challenges[3].end, gameStart.clone().add(gameRule.challenges[3].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(challenges[3].timeDisplay, "Starts in 12 hours");
  test.equal(challenges[3].userSelfGoal, selfGoalPerChallenge);
  test.equal(challenges[3].userActionCount, 0);
  test.equal(challenges[3].mayUpdate, false);
  test.equal(challenges[curIndex].instruction, "Do 20 pushups");

  curIndex =4;
  test.equal(challenges[curIndex].title, gameRule.challenges[4].title);
  test.equal(challenges[curIndex].description, gameRule.challenges[4].description);
  test.equal(challenges[curIndex].start, gameStart.clone().add(gameRule.challenges[3].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(challenges[curIndex].end, gameStart.clone().add(gameRule.challenges[4].dueFromStart, 'minutes').format(dateTimeFormat) );
  test.equal(challenges[curIndex].timeDisplay, "Starts in 2 days");
  test.equal(challenges[curIndex].userSelfGoal, selfGoalPerChallenge);
  test.equal(challenges[curIndex].userActionCount, 0);
  test.equal(challenges[curIndex].mayUpdate, false);
  test.equal(challenges[curIndex].instruction, "Do 20 pushups");
});