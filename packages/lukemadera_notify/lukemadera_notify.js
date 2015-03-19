lmNotify ={};

//private
lmNotifyHelpers ={};
lmNotifyTypes ={};

/**
@usage
var type ="notifType1";
var data ={
  //fill custom data here - used for selecting the appropriate user ids to notify and for populating/creating the push, email, in app, and sms notifications content
};
lmNotify.send(type, data, {});
*/
lmNotify.send =function(type, data, params) {
  if(lmNotifyTypes[type]) {
    lmNotifyTypes[type](type, data, params);
  }
  else {
    console.log('lmNotify.send error - invalid type: '+type);
  }
};