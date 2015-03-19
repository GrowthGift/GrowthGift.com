Meteor.methods({
  lmNotifyMarkRead: function(userId, messageId, params) {
    lmNotify.markMessageRead(userId, messageId, params);
  },
  lmNotifyUpdateNotificationCount: function(userId, count, params) {
    lmNotify.updateNotificationCount(userId, count, params);
  }
});

/**
@param {String} userId Id of user to mark message(s) read for
@param {String} [messageId] If set and not false, will mark only this message read. Otherwise will mark ALL messages read
@param {Object} params
*/
lmNotify.markMessageRead =function(userId, messageId, params) {
  var query ={
    userId: userId
  };
  var modifier ={};

  //mark ONE read
  if(messageId) {
    query['messages._id'] =messageId;
    modifier ={
      $set: {}
    };
    modifier.$set['messages.$.status'] ='read';
    NotificationsCollection.update(query, modifier, function(error, valid) {
      if(error) {
        console.log(error);
      }
    });
  }

  //mark ALL read
  else {
    //no way to update more than one element in an array with mongo? //http://stackoverflow.com/questions/14720734/mongodb-update-multiple-records-of-array //http://stackoverflow.com/questions/4669178/how-to-update-multiple-array-elements-in-mongodb
    var notification =NotificationsCollection.findOne(query, {messages:1});
    modifier ={
      $set: {}
    };
    var ii;
    var atLeastOneUpdate =false;
    for(ii =0; ii<notification.messages.length; ii++) {
      if(notification.messages[ii].status !=='read') {
        modifier.$set['messages.'+ii+'.status'] ='read';
        atLeastOneUpdate =true;
      }
    }
    if(atLeastOneUpdate) {
      NotificationsCollection.update(query, modifier);
    }
  }
  
};

/**
@param {String} userId
@param {Number|String} count The value to set notification count to for this user OR 'increment' OR 'decrement' to add or subtract one
@param {Object} params
*/
lmNotify.updateNotificationCount =function(userId, count, params) {
  if(count ==='increment' || count ==='decrement') {
    var notification =NotificationsCollection.findOne({userId: userId}, {notificationCount:1}).fetch();
    var newCount =notification.notificationCount;
    if(count ==='increment') {
      newCount++;
    }
    else if(count ==='decrement') {
      newCount--;
    }
    NotificationsCollection.update({userId: userId}, {$set: {notificationCount: newCount} });
    //update push notifications
    Push.setBadge(newCount);
  }
  else {
    NotificationsCollection.update({userId: userId}, {$set: {notificationCount: count} });
    //update push notifications
    Push.setBadge(count);
  }
};

/**
@param {String} userId
@param {Object} params
*/
lmNotify.readNotifications =function(userId, params) {
  // return NotificationsCollection.find({userId: userId});
  return NotificationsCollection.findOne({userId: userId});
};