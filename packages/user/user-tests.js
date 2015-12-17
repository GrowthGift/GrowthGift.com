// Mocks
// Not working..
// msTimezone.getBrowserTimezont =function() {
//   return '-07:00';
// }

var dtUTC ='2015-07-01 09:15:00+00:00';

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

Tinytest.add('convert UTC date time to user timezone', function (test) {
  var user ={
    profile: {
      timezone: '+03:30'
    }
  };
  test.equal(ggUser.toUserTime(user, dtUTC, null), '2015-07-01 12:45:00+03:30');
});

// TODO - need to mock out msTimezone.getBrowserTimezone to always return the SAME result..
// Tinytest.add('convert UTC date time to default timezone', function (test) {
//   // Should use a default (of -07:00) if no user timezone.
//   var user ={
//     profile: {
//     }
//   };
//   test.equal(ggUser.toUserTime(user, dtUTC, null), '2015-07-01 02:15:00-07:00');

//   // Should allow no user (in case not logged in) and still use a default.
//   test.equal(ggUser.toUserTime(null, dtUTC, null), '2015-07-01 02:15:00-07:00');
// });

Tinytest.add('convert UTC date time to user timezone with custom format', function (test) {
  var user ={
    profile: {
      timezone: '-07:00'
    }
  };
  test.equal(ggUser.toUserTime(user, dtUTC, null, 'MMM DD, YYYY @ h:mma'), 'Jul 01, 2015 @ 2:15am');
  test.equal(ggUser.toUserTime(user, dtUTC, null, 'MM/DD/YY'), '07/01/15');
  test.isNotUndefined(ggUser.toUserTime(user, dtUTC, null, 'fromNow'));
});