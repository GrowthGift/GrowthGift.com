/**
@param {Object} params
  @param {Array} userIds
  @param {String} type The notification type that will be used to check (against user.notification) which notifications (if any) to send to this user, i.e. 'event_invite', 'event_vote_due_soon' [many more - see db_schema.json for full list]
  @param {String} notifId Unique id used to identify individual notification calls (for debugging)
@return {Object} (via Promise)
  @param {Object} users
    @param {Array} inAppUsers
    @param {Array} emailUsers
    @param {Array} smsUsers
    @param {Array} pushUsers
  @param {Object} params (via Promise) The input params so know how it was called (i.e. for keeping the correct params.type after returned)
*/
lmNotifyHelpers.separateUsers =function(params, callback) {
  var self =this;
  var testing = false;
  var ret = {
    users: {
      inAppUsers: [], emailUsers: [], smsUsers: [], pushUsers: []
    },
    params: params    //pass through/back the input params
  };
  var ii, nofificationUserFound;
  var goTrig;
  var users =Meteor.users.find({_id: {$in: params.userIds} }, {profile:1, emails:1})
  var usersCount =users.fetch().length;
  var notifications =NotificationsCollection.find({userId: {$in: params.userIds } }, {userId:1, settings:1, notificationCount:1}).fetch();
  users.forEach(function(user, index, cursor) {
    
    //append in a notification key (match up this user id with the notifications user id)
    notificationUserFound =false;
    for(ii =0; ii<notifications.length; ii++) {
      if(notifications[ii].userId ===user._id) {
        user.notifications =notifications[ii];
        notificationUserFound =true;
        break;
      }
    }
    if(!notificationUserFound) {
      //set defaults
      user.notifications ={
        userId: user._id,
        settings: {
          enabled: {
            inApp: 1,
            email: 1,
            sms: 1,
            push: 1
          },
          all: {
            inApp: 1,
            email: 1,
            sms: 1,
            push: 1
          },
          type: {}
        },
        messages: [],
        notificationCount: 0
      };
      //save in database for next time
      NotificationsCollection.insert(user.notifications);
    }

    if (!testing) {
      var ret1 =self.checkNotificationSettings(user, {type: params.type, notifId:params.notifId});
      if(ret1.inApp) {
        ret.users.inAppUsers.push(user);
      }
      if(ret1.email) {
        ret.users.emailUsers.push(user);
      }
      if(ret1.sms) {
        ret.users.smsUsers.push(user);
      }
      if(ret1.push) {
        ret.users.pushUsers.push(user);
      }
    } else {
      ret.users.inAppUsers.push(user);
      ret.users.emailUsers.push(user);
      ret.users.smsUsers.push(user);
      // ret.users.pushUsers.push(user);    //don't do push if testing
    }

    console.log('users.forEach: index: '+index+' usersCount-1: '+(usersCount-1));    //TESTING
    //if on the last one, done
    if(index ===(usersCount-1)) {
      console.log('users.forEach callback: index: '+index);   //TESTING
      callback(ret);
    }
  });
};

/**
@param {Object} user
  @param {String} _id
  @param {String} email
  //@param {Object} phone
  @param {Object} notifications The user's notifications object that will be checked to see which types of notification to send to this user. If none set, defaults will be used.
    @param {Object} settings
@param {Object} params
  @param {String} type The notification type that will be used to check (against user.notification) which notifications (if any) to send to this user, i.e. 'event_invite', 'event_vote_due_soon' [many more - see db_schema.json for full list]
  @param {String} notifId Unique id used to identify individual notification calls (for debugging)
@return {Object}
  @param {Boolean} inApp True to send an in app notification to this user
  @param {Boolean} email True to send an email to this user
  @param {Boolean} sms True to send a text/SMS to this user
  @param {Boolean} push True to send a push notification to this user
*/
lmNotifyHelpers.checkNotificationSettings =function(user, params) {
  var ret ={inApp:false, email:false, sms:false, push:false};

  //hardcoded must match what the defaults are set for notifications settings
  var emailDefaults = {
    //@todoseed
    // "notifType1": 1,
    // "notifType2": 1,
  };
  var pushDefaults ={
    //@todoseed
    // "notifType1": 1,
    // "notifType2": 1,
  };
  
  //will be set to true if that particular notification has already been set (so no need to check further)
  var isSet ={
    inApp: false,
    email: false,
    sms: false,
    push: false
  };
  //if don't have email, can't send one!
  if(user.emails ===undefined || !user.emails.length) {
    isSet.email =true;
  }
  //if don't have phone number, can't send a sms!
  // if(!user.phone || !user.phone.number) {
  //   isSet.sms =true;
  // }
    
  if(user.notifications !==undefined && user.notifications.settings !==undefined) {
    //A. check if enabled or disabled - if disabled, set to false and set isSet so no more checks are made. If enabled, do nothing since need to check more specific items.
    if(user.notifications.settings.enabled !==undefined) {
      if(!isSet.inApp && user.notifications.settings.enabled.inApp !==undefined && !parseInt(user.notifications.settings.enabled.inApp, 10) ) {
        ret.inApp =false;
        isSet.inApp =true;
      }
      if(!isSet.email && user.notifications.settings.enabled.email !==undefined && !parseInt(user.notifications.settings.enabled.email, 10) ) {
        ret.email =false;
        isSet.email =true;
      }
      if(!isSet.sms && user.notifications.settings.enabled.sms !==undefined && !parseInt(user.notifications.settings.enabled.sms, 10) ) {
        ret.sms =false;
        isSet.sms =true;
      }
      if(!isSet.push && user.notifications.settings.enabled.push !==undefined && !parseInt(user.notifications.settings.enabled.push, 10) ) {
        ret.push =false;
        isSet.push =true;
      }
    }
    
    if(params.type !==undefined) {
      //check from most specific to most general
      //B. [more specific checks]
      //@todo
      
      //C. check by notification type
      if(user.notifications.settings.type !==undefined && user.notifications.settings.type[params.type] !==undefined) {
        if(!isSet.inApp && user.notifications.settings.type[params.type].inApp !==undefined) {
          if(parseInt(user.notifications.settings.type[params.type].inApp, 10) ) {
            ret.inApp =true;
          }
          else {
            ret.inApp =false;
          }
          isSet.inApp =true;
        }
        if(!isSet.email && user.notifications.settings.type[params.type].email !==undefined) {
          if(parseInt(user.notifications.settings.type[params.type].email, 10) ) {
            ret.email =true;
          }
          else {
            ret.email =false;
          }
          isSet.email =true;
        }
        if(!isSet.sms && user.notifications.settings.type[params.type].sms !==undefined) {
          if(parseInt(user.notifications.settings.type[params.type].sms, 10) ) {
            ret.sms =true;
          }
          else {
            ret.sms =false;
          }
          isSet.sms =true;
        }
        if(!isSet.push && user.notifications.settings.type[params.type].push !==undefined) {
          if(parseInt(user.notifications.settings.type[params.type].push, 10) ) {
            ret.push =true;
          }
          else {
            ret.push =false;
          }
          isSet.push =true;
        }
      }
    }
    
    //D. check by generic notification settings
    if(user.notifications.settings.all !==undefined) {
      if(!isSet.inApp && user.notifications.settings.all.inApp !==undefined) {
        if(parseInt(user.notifications.settings.all.inApp, 10) ) {
          ret.inApp =true;
        }
        else {
          ret.inApp =false;
        }
        isSet.inApp =true;
      }
      if(!isSet.email && user.notifications.settings.all.email !==undefined) {
        if(parseInt(user.notifications.settings.all.email, 10) ) {
          ret.email =true;
        }
        else {
          ret.email =false;
        }
        isSet.email =true;
      }
      if(!isSet.sms && user.notifications.settings.all.sms !==undefined) {
        if(parseInt(user.notifications.settings.all.sms, 10) ) {
          ret.sms =true;
        }
        else {
          ret.sms =false;
        }
        isSet.sms =true;
      }
      if(!isSet.push && user.notifications.settings.all.push !==undefined) {
        if(parseInt(user.notifications.settings.all.push, 10) ) {
          ret.push =true;
        }
        else {
          ret.push =false;
        }
        isSet.push =true;
      }
    }
  }
  
  //E. if still not set, use defaults
  if(!isSet.inApp) {
    ret.inApp =true;
    isSet.inApp =true;
  }
  if(!isSet.email) {
    ret.email =true;
    isSet.email =true;
  }
  if(!isSet.sms) {
    ret.sms =true;
    isSet.sms =true;
  }
  if(!isSet.push) {
    ret.push =true;
    isSet.push =true;
  }

  //app wide overrides
  // ret.email =false;   //do NOT send ANY emails right now    //@todo - change this to send emails again
  
  //TESTING
  // console.log('checkNotificationSettings: ret: '+JSON.stringify(ret)+' type: '+params.type+' user: '+user.first_name+' '+user.last_name+' user.notifications.settings: '+JSON.stringify(user.notifications.settings));
  // var userInfo =" user: "+user.first_name+" "+user.last_name+" "+user._id+" ";
  // if(user.email !==undefined) {
  //   userInfo+=user.email+" ";
  // }
  // if(user.phone !==undefined && user.phone.number !==undefined) {
  //   userInfo+=user.phone.number+" ";
  // }
  // console.log('checkNotificationSettings: ret: '+JSON.stringify(ret)+' type: '+params.type+' notifId: '+params.notifId +userInfo);    //TESTING
  
  return ret;
};