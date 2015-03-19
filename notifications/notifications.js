if(Meteor.isClient) {
  function formatMessages(messages, params) {
    var iconMap ={
      //@todoseed
      // 'notifType1': 'fa fa-image-o',
      // 'notifType2': 'fa fa-thumbs-up',
    };

    var ii, xx;
    for(ii =0; ii<messages.length; ii++) {
      //set icon
      messages[ii].xDisplay ={
        icon: ''
      };
      for(xx in iconMap) {
        if(messages[ii].notificationType ===xx) {
          messages[ii].xDisplay.icon =iconMap[xx];
          break;
        }
      }
      //set time ago
      messages[ii].xDisplay.timeFromNow =moment(messages[ii].createdAt, 'YYYY-MM-DD HH:mm:ssZ').fromNow();
    }

    //sort by message created time
    messages =nrArray.sort2D(messages, 'createdAt', {order:'desc'});

    return messages;
  }

  Template.notifications.rendered =function() {
    //reset notification count on viewing of this page
    Meteor.call("lmNotifyUpdateNotificationCount", Meteor.userId(), 0, {});
  };

  Template.notifications.helpers({
    notifications: function() {
      var notifications =lmNotify.readNotifications(Meteor.userId(), {});
      notifications.messages =formatMessages(notifications.messages, {});
      return notifications;
    },
    hasNotifications: function() {
      var notifications =lmNotify.readNotifications(Meteor.userId(), {});
      var ret;
      if(notifications ===undefined || !notifications || notifications.messages ===undefined || !notifications.messages.length) {
        ret =false;
      }
      else {
        ret =true;
      }
      return ret;
    }
  });

  Template.notifications.events({
    'click .notifications-item': function(evt, template) {
      //mark as read
      Meteor.call("lmNotifyMarkRead", Meteor.userId(), this._id, {});

      //go to link
      if(this.linkUrlPart) {
        Router.go('/'+this.linkUrlPart);
      }
    }
  });
}