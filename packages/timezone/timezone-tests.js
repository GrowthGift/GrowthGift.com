var testDates =[
  {
    local: '2015-07-01 09:30:00-09:00',
    utc: '2015-07-01 18:30:00+00:00'
  },
  {
    local: '2015-07-01 20:15:00-09:00',
    utc: '2015-07-02 05:15:00+00:00'
  },
  {
    local: '2015-07-01 09:30:00+04:30',
    utc: '2015-07-01 05:00:00+00:00'
  },
  {
    local: '2015-07-01 20:15:00+04:30',
    utc: '2015-07-01 15:45:00+00:00'
  },
  // Daylight savings
  {
    local: '2015-12-01 07:30:00-10:00',
    utc: '2015-12-01 17:30:00+00:00'
  },
  {
    local: '2015-12-01 20:15:00-10:00',
    utc: '2015-12-02 06:15:00+00:00'
  },
  {
    local: '2015-12-01 06:30:00+04:30',
    utc: '2015-12-01 02:00:00+00:00'
  },
  {
    local: '2015-12-01 20:15:00+04:30',
    utc: '2015-12-01 15:45:00+00:00'
  },
  // UTC already
  {
    local: '2015-07-01 18:35:00+00:00',
    utc: '2015-07-01 18:35:00+00:00'
  },
  {
    local: '2015-12-01 02:35:00+00:00',
    utc: '2015-12-01 02:35:00+00:00'
  },
];
var times =[
  {
    offset: -270,
    tz: '-04:30',
    local: '2015-06-15 13:40:00-04:30',
    utc: '2015-06-15 18:10:00+00:00'
  },
  {
    offset: 0,
    tz: '+00:00',
    local: '2015-06-15 13:41:00+00:00',
    utc: '2015-06-15 13:41:00+00:00'
  },
  {
    offset: 600,
    tz: '+10:00',
    local: '2015-06-15 13:42:00+10:00',
    utc: '2015-06-15 03:42:00+00:00'
  }
];

Tinytest.add('convert to UTC', function (test) {
  testDates.forEach(function(td) {
    test.equal(msTimezone.convertToUTC(td.local, {}), td.utc);
  });
});

Tinytest.add('convert from UTC', function (test) {
  testDates.forEach(function(td) {
    test.equal(msTimezone.convertFromUTC(td.utc, td.local, {}), td.local);
  });

  // browser offsets converted to timezones should work too
  times.forEach(function(time) {
    test.equal(msTimezone.convertFromUTC(time.utc, time.tz, {}), time.local);
  });

});

Tinytest.add('get browser timzeone', function (test) {
  times.forEach(function(time) {
    test.equal(msTimezone.getBrowserTimezone(time.offset), time.tz);
  });
});
