ggConstants ={
  gameSelectNew: '_new',
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ssZ',
  dateTimeDisplay: 'ddd MMM DD, YYYY h:mma'
};

ggConstants.curDateTime =function() {
  return moment().format(ggConstants.dateTimeFormat);
};