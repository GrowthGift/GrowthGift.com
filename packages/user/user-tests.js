Tinytest.add('get user first name and last initial', function (test) {
  var users =[
    {
      profile: {
        name: 'Kayla'
      }
    }
  ];
  test.equal(ggUser.getName(users[0]), 'Kayla');
});
