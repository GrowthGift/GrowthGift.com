msTimezone ={
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ssZ',
  dateTimeFormatNoSeconds: 'YYYY-MM-DD HH:mm:00Z',
  dateTimeDisplay: 'ddd MMM DD, YYYY @ h:mma'
};

/**
@param {String} [format ='YYYY-MM-DD HH:mm:ssZ'] The format OR 'moment' to
 to return a raw moment object.
@param {Object} [nowTime] ONLY FOR TESTS - the current time moment object.
*/
msTimezone.curDateTime =function(format, nowTime) {
  nowTime =nowTime || moment();
  format = ( format ) ? format : msTimezone.dateTimeFormat;
  // Important to use UTC so all timezones are stored in the SAME timezone
  // for easy comparisons.
  var dtMoment =nowTime.utc();
  return ( format ==='moment' ) ? dtMoment : dtMoment.format(format);
};

/**
@param {Object} params
  @param {Object} [moment] The already formed moment object
  @param {String} [format ='YYYY-MM-DD HH:mm:ssZ']
*/
msTimezone.convertToUTC =function(dateTimeString, params) {
  var format =params.format ? params.format : msTimezone.dateTimeFormat;
  var dateTimeMoment =params.moment ? params.moment :
   moment(dateTimeString, format);
  return dateTimeMoment.utc().format(format);
};

/**
@param {String} tzTo A string that has a timezone in it, e.g. '-10:00', '+04:30'
@param {Object} params
  @param {Object} [moment] The already formed moment object
  @param {String} [format ='YYYY-MM-DD HH:mm:ssZ']
  @param {String} [outputFormat] If set, will return in this format instead of
   `format`. Set to `fromNow` or `from` to do a moment fromNow() or from() format.
  @param {Object} [outputFromNowTime =msTimezone.curDateTime('moment')] if
   `outputFormat` is `from`, this is the moment it will be from.
*/
msTimezone.convertFromUTC =function(dateTimeString, tzTo, params) {
  var format =params.format ? params.format : msTimezone.dateTimeFormat;
  var dateTimeMoment =params.moment ? params.moment :
   moment(dateTimeString, format);

  params =params || {};
  if(params.outputFormat && params.outputFormat === 'from' && !params.outputFromNowTime) {
    params.outputFromNowTime =msTimezone.curDateTime('moment');
  }

  dateTimeMomentTz =dateTimeMoment.utcOffset(tzTo);
  return ( params.outputFormat && params.outputFormat ==='fromNow' ) ?
   dateTimeMomentTz.fromNow() :
   ( params.outputFormat && params.outputFormat ==='from' && params.outputFromNowTime ) ?
   dateTimeMomentTz.from(params.outputFromNowTime) :
   ( params.outputFormat ) ? dateTimeMomentTz.format(params.outputFormat) :
   dateTimeMomentTz.format(format);
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
