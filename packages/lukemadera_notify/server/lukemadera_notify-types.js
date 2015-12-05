/**
@toc
0. devTest
*/

/**
*/
lmNotifyTypes.devTest =function(type, data, params) {
  var notifId =type;

  var userIds =[Meteor.userId()];   //@todo - select proper set of user ids based on data
  
  lmNotifyHelpers.separateUsers({type:type, userIds: userIds, notifId:notifId}, function(retSep) {
    
    var inAppData ={
      subject: 'New Notification inApp',
      html: 'New Notification inApp',    //@todo - fill with data
      notificationType: type,
      linkUrlPart: 'dev-test-test?p1=yes'
    };
    var pushData ={
      title: 'New Notification push',
      text: 'New Notification push',    //@todo - fill with data
    };
    var emailData ={
      subject: 'New Notification email',
      html: 'New Notification email',    //@todo - fill with data
    };
    var smsData =false;
    
    lmNotify.sendAll(retSep.users, inAppData, pushData, emailData, smsData, {});
    
  });
};

lmNotifyTypes.gameChallengeComplete =function(type, data, params) {
  var notifId =type;

  var userIds =data.notifyUserIds;
  var userName =data.user.profile.name;
  var gameName =data.game.title;
  var hrefGame =ggUrls.game(data.game.slug);
  // Remove leading slash
  hrefGame =hrefGame.slice(1, hrefGame.length);

  lmNotifyHelpers.separateUsers({type:type, userIds: userIds, notifId:notifId}, function(retSep) {

    var inAppData ={
      subject: 'Game Challenge Completed',
      html: userName + ' completed a challenge in ' + gameName,
      notificationType: type,
      linkUrlPart: hrefGame
    };
    var pushData ={
      title: 'Game Challenge Completed',
      text: userName + ' completed a challenge in ' + gameName
    };
    var emailData ={
      subject: 'Game Challenge Completed',
      html: userName + ' completed a challenge in ' + gameName
    };
    var smsData =false;

    lmNotify.sendAll(retSep.users, inAppData, pushData, emailData, smsData, {});

  });
};