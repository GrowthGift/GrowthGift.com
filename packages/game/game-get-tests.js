var dtFormat ='YYYY-MM-DD HH:mm:ssZ';
var nowTime =ggMockData._nowTime;
var nowTimeFormat =ggMockData._nowTimeFormat;
// NOTE: do NOT use dates that go around daylight savings!

Tinytest.add('get challenges with user info', function (test) {
  var gameRule =ggMockData.getGameRule('gameRule2');
  var game ={
    _id: 'game1',
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
  };
  var userGames =[
    {
      gameId: game._id,
      userId: 'user1',
      challenges: [
        {
          actionCount: 1,
          updatedAt: nowTime.clone().subtract((2.4*24), 'hours').format(dtFormat)
        },
        {
          actionCount: 2,
          updatedAt: nowTime.clone().subtract((1.4*24), 'hours').format(dtFormat)
        },
        {
          actionCount: 3,
          updatedAt: nowTime.clone().subtract((0.4*24), 'hours').format(dtFormat)
        }
      ]
    },
    {
      gameId: game._id,
      userId: 'user2',
      challenges: [
        {
          actionCount: 5,
          updatedAt: nowTime.clone().subtract((2.4*24), 'hours').format(dtFormat)
        },
        {
          actionCount: 6,
          updatedAt: nowTime.clone().subtract((1.4*24), 'hours').format(dtFormat)
        },
        {
          actionCount: 4,
          updatedAt: nowTime.clone().subtract((0.4*24), 'hours').format(dtFormat)
        }
      ]
    }
  ];
  var ret =ggGame.getChallengesWithUser(game, gameRule, userGames[0], nowTime, userGames[1]);
  var challenges =ret.challenges;
  var gameStart =moment(game.start, dtFormat).utc();
  var selfGoalPerChallenge =Math.ceil( game.users[0].selfGoal / gameRule.challenges.length );

  var curIndex =0;
  test.equal(challenges[curIndex].title, gameRule.challenges[0].title);
  test.equal(challenges[curIndex].description, gameRule.challenges[0].description);
  test.equal(challenges[curIndex].start, gameStart.format(dtFormat) );
  test.equal(challenges[curIndex].end, gameStart.clone().add(gameRule.challenges[0].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(challenges[curIndex].started, true);
  test.equal(challenges[curIndex].ended, true);
  // test.equal(challenges[curIndex].timeDisplay, "Ended 2 days ago");
  test.equal(challenges[curIndex].userSelfGoal, selfGoalPerChallenge);
  test.equal(challenges[curIndex].userActionCount, 1);
  test.equal(challenges[curIndex].mayUpdate, false);
  test.equal(challenges[curIndex].instruction, "You did 1 / 20 pushups");
  test.equal(challenges[curIndex].buddyInstruction, "Buddy did 5 / 10 pushups");

  curIndex =1;
  test.equal(challenges[curIndex].title, gameRule.challenges[1].title);
  test.equal(challenges[curIndex].description, gameRule.challenges[1].description);
  test.equal(challenges[curIndex].start, gameStart.clone().add(gameRule.challenges[0].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(challenges[curIndex].end, gameStart.clone().add(gameRule.challenges[1].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(challenges[curIndex].started, true);
  test.equal(challenges[curIndex].ended, true);
  // test.equal(challenges[curIndex].timeDisplay, "Ended 12 hours ago");
  test.equal(challenges[curIndex].userSelfGoal, selfGoalPerChallenge);
  test.equal(challenges[curIndex].userActionCount, 2);
  test.equal(challenges[curIndex].mayUpdate, false);
  test.equal(challenges[curIndex].instruction, "You did 2 / 20 pushups");
  test.equal(challenges[curIndex].buddyInstruction, "Buddy did 6 / 10 pushups");

  curIndex =2;
  test.equal(challenges[curIndex].title, gameRule.challenges[2].title);
  test.equal(challenges[curIndex].description, gameRule.challenges[2].description);
  test.equal(challenges[curIndex].start, gameStart.clone().add(gameRule.challenges[1].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(challenges[curIndex].end, gameStart.clone().add(gameRule.challenges[2].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(challenges[curIndex].started, true);
  test.equal(challenges[curIndex].ended, false);
  // test.equal(challenges[curIndex].timeDisplay, "Ends in 12 hours");
  test.equal(challenges[curIndex].userSelfGoal, selfGoalPerChallenge);
  test.equal(challenges[curIndex].userActionCount, 3);
  test.equal(challenges[curIndex].mayUpdate, true);
  // Should adjust for missed ones. Goal is 100, have done 3, so have 97
  // left in 3 days, which is 33 per day.
  test.equal(challenges[curIndex].instruction, "You've done 3 / 33 pushups");
  // Should adjust for missed ones. Goal is 50, have done 11, so have 39
  // left in 3 days, which is 13 per day.
  test.equal(challenges[curIndex].buddyInstruction, "Buddy has done 4 / 13 pushups");

  curIndex =3;
  test.equal(challenges[curIndex].title, gameRule.challenges[3].title);
  test.equal(challenges[curIndex].description, gameRule.challenges[3].description);
  test.equal(challenges[curIndex].start, gameStart.clone().add(gameRule.challenges[2].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(challenges[curIndex].end, gameStart.clone().add(gameRule.challenges[3].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(challenges[curIndex].started, false);
  test.equal(challenges[curIndex].ended, false);
  // test.equal(challenges[curIndex].timeDisplay, "Starts in 12 hours");
  test.equal(challenges[curIndex].userSelfGoal, selfGoalPerChallenge);
  test.equal(challenges[curIndex].userActionCount, 0);
  test.equal(challenges[curIndex].mayUpdate, false);
  // Should adjust for missed ones. Goal is 100, have done 3, so have 97
  // left in 3 days, which is 33 per day.
  test.equal(challenges[curIndex].instruction, "Do 33 pushups");
  // Should adjust for missed ones. Goal is 50, have done 11, so have 39
  // left in 3 days, which is 13 per day.
  test.equal(challenges[curIndex].buddyInstruction, "Help your buddy do 13 pushups");

  curIndex =4;
  test.equal(challenges[curIndex].title, gameRule.challenges[4].title);
  test.equal(challenges[curIndex].description, gameRule.challenges[4].description);
  test.equal(challenges[curIndex].start, gameStart.clone().add(gameRule.challenges[3].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(challenges[curIndex].end, gameStart.clone().add(gameRule.challenges[4].dueFromStart, 'minutes').format(dtFormat) );
  test.equal(challenges[curIndex].started, false);
  test.equal(challenges[curIndex].ended, false);
  // test.equal(challenges[curIndex].timeDisplay, "Starts in 2 days");
  test.equal(challenges[curIndex].userSelfGoal, selfGoalPerChallenge);
  test.equal(challenges[curIndex].userActionCount, 0);
  test.equal(challenges[curIndex].mayUpdate, false);
  // Should adjust for missed ones. Goal is 100, have done 3, so have 97
  // left in 3 days, which is 33 per day.
  test.equal(challenges[curIndex].instruction, "Do 33 pushups");
  // Should adjust for missed ones. Goal is 50, have done 11, so have 39
  // left in 3 days, which is 13 per day.
  test.equal(challenges[curIndex].buddyInstruction, "Help your buddy do 13 pushups");
});