/**
Goes through all notifications.bulk and sends any queued messages if at or
 past the wait period from the last send time.
*/
lmNotify.bulkSend =function() {
  var now =moment().utc();
  var notifications =NotificationsCollection.find({}, { fields: { userId: 1, bulk: 1, notificationCount: 1 } }).fetch();
  notifications.forEach(function(notification) {
    lmNotifyHelpers.bulkSendOne(notification, now);
  });
};

/**
Sends any pending bulk messages for ONE user, and updates that user's
 notifications accordingly (clears out bulked messages, sets last sent at
 time).
*/
lmNotifyHelpers.bulkSendOne =function(notification, nowTime) {
  var momentFormat ='YYYY-MM-DD HH:mm:ssZ';
  var keys =['email', 'sms', 'push'];
  var modifier ={
    $set: {}
  };
  // For performance, will ONLY look up if have at least one, and will only
  // look up ONCE.
  var user =null;
  var atLeastOne =false, channel, timeDiff, haveMessages, messagesParams;
  if(!notification.bulk) {
    return;
  }
  keys.forEach(function(key) {
    haveMessages =false;    // Reset
    channel =notification.bulk[key];
    // See if we have any messages
    if(channel && channel.messages && channel.messages.length) {
      if(!channel.lastSendAt) {
        // Have never sent before, so send now no matter what
        haveMessages =true;
      }
      else {
        timeDiff =nowTime.clone().diff(moment(channel.lastSendAt, momentFormat), 'minutes');
        if(timeDiff >=channel.wait) {
          // At or over the time to wait, so send now
          haveMessages =true;
        }
      }
    }
    if(haveMessages) {
      if(!user) {
        user =Meteor.users.findOne({ _id: notification.userId }, { fields: { emails: 1, profile: 1 } });
      }
      messagesParams =(key ==='push') ?
       { badge: notification.notificationCount } : {};
      lmNotifyHelpers.bulkSendMessages(channel.messages, key, user, messagesParams);
      modifier.$set['bulk.'+key+'.lastSendAt'] =nowTime.format(momentFormat);
      modifier.$set['bulk.'+key+'.messages'] =[];
      atLeastOne =true;
    }
  });

  if(atLeastOne) {
    NotificationsCollection.update({ userId: notification.userId }, modifier, function(err, result) {
      // console.info('lmNotifyHelpers.bulkSendOne update', notification.userId, modifier, err, result);
    });
  }
};

/**
@param Object params
  @param {Number} [badge] For push type only
*/
lmNotifyHelpers.bulkSendMessages =function(messages, type, user, params) {
  var numMessages =messages.length;
  if(type ==='email') {
    var email =(user.emails && user.emails[0] && user.emails[0].address) || null;
    if(email) {
      var html ="There's been some activity while you've been away!<br /><br />";
      var countByType ={};
      messages.forEach(function(message) {
        if(!countByType[message.type]) {
          countByType[message.type] =1;
        }
        else {
          countByType[message.type]++;
        }
      });
      var typeKey;
      for(typeKey in countByType) {
        html += countByType[typeKey] + " " + typeKey + " updates.<br />";
      }
      lmNotify.sendEmail({
        to: [ email ],
        subject: numMessages + ' new notifications',
        html: html
      });
    }
  }
  else if(type ==='push') {
    lmNotify.sendPush({
      title: numMessages + ' new notifications',
      text: 'Go to the app to see your ' + numMessages + ' new notifications.',
      badge: params.badge
    }, user._id, {});
  }
  else if(type ==='sms') {
    // TODO
  }
};