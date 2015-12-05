ggConstants ={
  gameSelectNew: '_new',
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ssZ',
  dateTimeDisplay: 'ddd MMM DD, YYYY h:mma'
};

ggConstants.curDateTime =function() {
  // Important to use UTC so all timezones are stored in the SAME timezone
  // for easy comparisons.
  return moment().utc().format(ggConstants.dateTimeFormat);
};