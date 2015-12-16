msTimezone ={
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ssZ',
  dateTimeDisplay: 'ddd MMM DD, YYYY @ h:mma'
};

msTimezone.curDateTime =function() {
  // Important to use UTC so all timezones are stored in the SAME timezone
  // for easy comparisons.
  return moment().utc().format(msTimezone.dateTimeFormat);
};

/**
@param {Object} params
  @param {Object} [moment] The already formed moment object
  @param {String} [format ='YYYY-MM-DD HH:mm:ssZ']
*/
msTimezone.convertToUTC =function(dateTimeString, params) {
  format =format ? format : msTimezone.dateTimeFormat;
  var dateTimeMoment =params.moment ? params.moment :
   moment(dateTimeString, format);
  return dateTimeMoment.utc().format(format);
};

/**
@param {String} tzTo A string that has a timezone in it, e.g. '-10:00', '+04:30'
@param {Object} params
  @param {Object} [moment] The already formed moment object
  @param {String} [format ='YYYY-MM-DD HH:mm:ssZ']
*/
msTimezone.convertFromUTC =function(dateTimeString, tzTo, params) {
  format =format ? format : msTimezone.dateTimeFormat;
  var dateTimeMoment =params.moment ? params.moment :
   moment(dateTimeString, format);
  return dateTimeMoment.utcOffset(tzTo).format(format);
};

/**
@param {Number} [offset] Only used for testing purposes.
*/
msTimezone.getBrowserTimezone =function(offset) {
  offset =( offset !==undefined ) ? offset : moment().utcOffset();
  return msTimezone.offsetToTimezone(offset);
};

msTimezone.offsetToTimezone =function(offset) {
  var offsetPositive = ( offset >=0 ) ? offset : ( -1 * offset );
  var tz =( ( offset >=0 ) ? '+' : '-' ) +
   msTimezone.padNumber( Math.floor( offsetPositive / 60 ) ) + ':' +
   msTimezone.padNumber( ( offsetPositive % 60 ) );
  return tz;
};

msTimezone.padNumber =function(num, size) {
  size =size ? size : 2;
  num =num.toString();
  while (num.length <size) {
    num ="0" + num;
  }
  return num;
}
