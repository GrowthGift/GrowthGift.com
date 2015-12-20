Tinytest.add('may not buddy with self', function (test) {
  var game =ggMockData.getGame('game1');
  // user 3 has no buddy
  var gu =game.users[2];
  test.equal(ggMay.beGameBuddy(game, gu.userId, gu.buddyRequestKey), false);
});

Tinytest.add('may not buddy with user who already has a buddy', function (test) {
  var game =ggMockData.getGame('game1');
  // user 3 has no buddy, user 1 does
  var guSelf =game.users[2];
  var guBuddy =game.users[0];
  test.equal(ggMay.beGameBuddy(game, guSelf.userId, guBuddy.buddyRequestKey), false);
});

Tinytest.add('may not buddy with user if alredy have a buddy', function (test) {
  var game =ggMockData.getGame('game1');
  // user 3 has no buddy, user 1 does
  var guSelf =game.users[0];
  var guBuddy =game.users[2];
  test.equal(ggMay.beGameBuddy(game, guSelf.userId, guBuddy.buddyRequestKey), false);
});

Tinytest.add('may not buddy if incorrect buddy request key', function (test) {
  var game =ggMockData.getGame('game1');
  // user 3 has no buddy
  var guSelf =game.users[2];
  test.equal(ggMay.beGameBuddy(game, guSelf.userId, 'badRequestKey'), false);
});

Tinytest.add('may buddy with valid buddy request key', function (test) {
  var game =ggMockData.getGame('game1');
  // user 3 and 4 do not have a buddy
  var guSelf =game.users[2];
  var guBuddy =game.users[3];
  test.equal(ggMay.beGameBuddy(game, guSelf.userId, guBuddy.buddyRequestKey), true);
});
