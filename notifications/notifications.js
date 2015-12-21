Meteor.methods({
  saveNotificationSettings: function(doc, docId) {

    var onSuccess =function(error, result) {
      if(Meteor.isClient) {
        if(!error && result) {
        }
      }
    };

    lmNotify.saveSettings(doc, docId, Meteor.userId(), onSuccess);

  }
});

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
    messages =notoriiArray.sort2D(messages, 'createdAt', {order:'desc'});

    return messages;
  }

  Template.notifications.rendered =function() {
    //reset notification count on viewing of this page
    Meteor.call("lmNotifyUpdateNotificationCount", Meteor.userId(), 0, {});
  };

  Template.notifications.helpers({
    nav: function() {
      return {
        buttons: [
          {
            icon: 'fa fa-bell',
            html: 'Alerts',
            click: function() {
              Router.go('/notifications');
            }
          },
          {
            icon: 'fa fa-cog',
            html: 'Settings',
            click: function() {
              Router.go('/notifications?nav=settings');
            }
          }
        ]
      };
    },
    data: function() {
      return {
        template: (this.nav && this.nav ==='settings') ?
       'notificationsSettings' : 'notificationsAlerts'
      };
    }
  });

  Template.notificationsAlerts.helpers({
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

  Template.notificationsAlerts.events({
    'click .notifications-item': function(evt, template) {
      //mark as read
      Meteor.call("lmNotifyMarkRead", Meteor.userId(), this._id, {});

      //go to link
      if(this.linkUrlPart) {
        Router.go('/'+this.linkUrlPart);
      }
    }
  });

  Template.notificationsSettings.helpers({
    data: function() {
      var inputOpts ={
        emailOpts: [
          // { value: 0, label: 'Immediate'},
          { value: (3 * 60), label: '3 hours'},
          { value: (6 * 60), label: '6 hours'},
          { value: (12 * 60), label: '12 hours'},
          { value: (1 * 24 * 60), label: '1 day'},
          { value: (2 * 24 * 60), label: '2 days'},
          { value: (4 * 24 * 60), label: '4 days'},
          { value: (7 * 24 * 60), label: '7 days'}
        ],
        // smsOpts: [
        //   { value: 0, label: 'Immediate'},
        //   { value: (6 * 60), label: '6 hours'},
        //   { value: (12 * 60), label: '12 hours'},
        //   { value: (1 * 24 * 60), label: '1 day'},
        //   { value: (2 * 24 * 60), label: '2 days'},
        //   { value: (4 * 24 * 60), label: '4 days'}
        // ],
        pushOpts: [
          // { value: 0, label: 'Immediate'},
          { value: 10, label: '10 minutes'},
          { value: 30, label: '30 minutes'},
          { value: (1 * 60), label: '1 hour'},
          { value: (3 * 60), label: '3 hours'},
          { value: (6 * 60), label: '6 hours'},
          { value: (12 * 60), label: '12 hours'},
          { value: (1 * 24 * 60), label: '1 day'},
          { value: (2 * 24 * 60), label: '2 days'}
        ],
        showPush: Meteor.isCordova ? true : false
      };
      var notifications =lmNotify.readNotifications(Meteor.userId(), {});

      return {
        notifications: notifications,
        inputOpts: inputOpts,
        afMethod: notifications ? 'method-update' : 'method'
      };
    }
  });
}