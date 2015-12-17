ggUser ={};

ggUser.getByUsername =function(username) {
  return Meteor.users.findOne({ username: username });
}

/**
@param {String} [format ='firstLastInitial'] One of 'firstLastInitial'
*/
ggUser.getName =function(user, format) {
  if(!user || !user.profile || !user.profile.name) {
    return null;
  }
  var name =user.profile.name;
  var posSpace =name.indexOf(' ');
  var first, last ='', lastInitial ='';
  if(posSpace <0) {
    first =name;
    last ='';
  }
  else {
    first =name.slice(0, posSpace);
    last =name.slice((posSpace+1), name.length);
    lastInitial =( last && last.length >0 ) ? ( last.slice(0,1) + '.' ) : '';
  }
  return ( lastInitial ) ? ( first + ' ' + lastInitial ) : first;
}

ggUser.getUserTimezone =function(user) {
  // Default to browser time.
  return ( user && user.profile && user.profile.timezone ) ?
   user.profile.timezone : msTimezone.getBrowserTimezone();
};

/**
@param {String} dateTimeUTC The date time, in UTC, as a string in `format` format
@param {String} [format =msTimezone.dateTimeFormat]
@param {String} [outputFormat] If set, will return in this format instead of
 `format`. Set to `fromNow` or `from` to do a moment fromNow() or from() format.
@param {Object} [params]
  @param {Object} [outputFromNowTime] if `outputFormat` is `from`, this is the
   moment it will be from.
*/
ggUser.toUserTime =function(user, dateTimeUTC, format, outputFormat, params) {
  var timezone =ggUser.getUserTimezone(user);
  if(!timezone) {
    return datetime;
  }
  params =params || {};
  if(outputFormat && outputFormat === 'from' && (!params || !params.outputFromNowTime) ) {
    params.outputFromNowTime =msTimezone.curDateTime('moment');
  }
  var dateTimeUser =msTimezone.convertFromUTC(dateTimeUTC, timezone, { format: format });
  return ( outputFormat && outputFormat ==='fromNow' ) ?
   moment(dateTimeUser, format).fromNow() :
   ( outputFormat && outputFormat ==='from' && params && params.outputFromNowTime ) ?
   moment(dateTimeUser, format).from(params.outputFromNowTime) :
   ( outputFormat ) ? moment(dateTimeUser, format).format(outputFormat) :
   dateTimeUser;
};