/**
@toc
1. sendPush
2. sendEmail
3. sendInAppMessage
4. sendSms
5. sendAll
*/

/**
Sends a push notification to ONE user. Ideally could handle multiple users but since users will likely have DIFFERENT badge numbers even for the same message, need to do them all individually?
@toc 1.
@param {Object} pushInfo The push alert to send - will be passed directly to raix Push.send call
  @param {String} title
  @param {String} text
  @param {Number} badge
@param {String} userId
*/
lmNotify.sendPush =function(pushData, userId, params) {
  var pushObj =pushData;
  pushObj.from ='dummy';
  pushObj.query ={
    userId: userId
  };

  Push.send(pushObj);
  console.log('push sent: '+JSON.stringify(pushObj));
};

/**
@toc 2.
@param {Object} emailData
  @param {Array} to Array of email addresses to send email to
  @param {String} [from =cfgEmail.addresses.notify.name+" <"+cfgEmail.addresses.notify.email+">"] From email name and address
  @param {String} subject
  @param {String} html
*/
lmNotify.sendEmail =function(emailData, params) {
  var cfgEmail =Config.email({});
  var defaultEmailObj ={
    // from: cfgEmail.addresses.contact.name+" <"+cfgEmail.addresses.contact.email+">"
    from: cfgEmail.addresses.notify.name+" <"+cfgEmail.addresses.notify.email+">"
  };
  var emailObj =_.extend(defaultEmailObj, emailData);

  Meteor.Mandrill.send(emailObj);
  console.log('email sent: SUBJECT: '+emailObj.subject+' TO: '+JSON.stringify(emailObj.to));
};

/**
Add an in app notification / message for ONE user and increment the notification count
@toc 3.
@param {Object} inAppData
  @param {String} subject
  @param {String} html
  @param {String} notificationType
  @param {String} linkUrlPart
@param {Object} userNotifications The notifications collection object for this user to add in app message for (and bump notification count)
*/
lmNotify.sendInAppMessage =function(inAppData, userNotifications, params) {
  var defaultInAppObj ={
    _id: new Mongo.ObjectID().toHexString(),
    status: 'unread',
    createdAt: moment().format('YYYY-MM-DD HH:mm:ssZ')
  };
  var inAppObj =_.extend(defaultInAppObj, inAppData);

  var modifier ={
    $set: {
      notificationCount: (userNotifications.notificationCount+1)
    },
    $push: {
      messages: inAppObj
    }
  };
  NotificationsCollection.update({userId: userNotifications.userId}, modifier, function(error, result) {
    if(error) {
      console.log('sendInAppMessage update error: '+error);
    }
  });
  console.log('in app notification message added: SUBJECT: '+inAppObj.subject+' USERID: '+userNotifications.userId+' NOTIFICATIONCOUNT: '+(userNotifications.notificationCount+1));
};

/**
@toc 4.
*/
lmNotify.sendSms =function() {
  //@todo
};

/**
@toc 5.
@param {Object} sepUsers Users to notify, separated by notification protocol
  @param {Array} inAppUsers
  @param {Array} emailUsers
  @param {Array} smsUsers
  @param {Array} pushUsers
@param {Object} [inAppData]
  @param {String} subject
  @param {String} html
  @param {String} notificationType
  @param {String} linkUrlPart
@param {Object} [pushData]
  @param {String} title
  @param {String} text
@param {Object} [emailData]
  @param {String} subject
  @param {String} html
@param {Object} [smsData]
*/
lmNotify.sendAll =function(sepUsers, inAppData, pushData, emailData, smsData, params) {
  var self =this;
  var ii;
  
  if(pushData) {
    var pushDataTemp =EJSON.clone(pushData);
    //have to go through one by one to get proper badge number
    for(ii =0; ii<sepUsers.pushUsers.length; ii++) {
      pushDataTemp.badge =(sepUsers.pushUsers[ii].notifications.notificationCount +1);
      self.sendPush(pushDataTemp, sepUsers.pushUsers[ii]._id, {});
    }
  }

  if(emailData) {
    if(emailData.to ===undefined) {
      emailData.to =[];
    }
    for(ii =0; ii<sepUsers.emailUsers.length; ii++) {
      emailData.to.push(sepUsers.emailUsers[ii].emails[0].address);
    }
    if(emailData.to && emailData.to.length) {
      self.sendEmail(emailData, {});
    }
  }
  
  if(smsData) {
    //@todo
  }

  //important to do this LAST since it will update the notifications object (bump the notification count)
  if(inAppData) {
    for(ii =0; ii<sepUsers.inAppUsers.length; ii++) {
      self.sendInAppMessage(inAppData, sepUsers.inAppUsers[ii].notifications)
    }
  }
};