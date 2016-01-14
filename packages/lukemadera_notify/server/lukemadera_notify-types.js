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
    
    lmNotify.sendAll(retSep.users, inAppData, pushData, emailData, smsData, {emailToField: 'bcc'});
    
  });
};

lmNotifyTypes.gameChallengeComplete =function(type, data, params) {
  var notifId =type;

  var userIds =data.notifyUserIds;
  var userName =data.user.profile.name;
  var gameName =data.game.title;
  var hrefGame =ggUrls.removeLeadingSlash(ggUrls.game(data.game.slug));

  lmNotifyHelpers.separateUsers({type:type, userIds: userIds, notifId:notifId}, function(retSep) {

    var inAppData ={
      subject: 'Challenge Completed',
      html: userName + ' completed a challenge in ' + gameName,
      notificationType: type,
      linkUrlPart: hrefGame
    };
    var pushData ={
      title: 'Challenge Completed',
      text: userName + ' completed a challenge in ' + gameName
    };
    var emailData ={
      subject: 'Challenge Completed',
      html: userName + ' completed a challenge in ' + gameName
    };
    var smsData =false;

    lmNotify.sendAll(retSep.users, inAppData, pushData, emailData, smsData, {});

  });
};

lmNotifyTypes.gameChallengeBuddyMotivation =function(type, data, params) {
  var notifId =type;

  var userIds =data.notifyUserIds;
  var userName =data.user.profile.name;
  var gameName =data.game.title;
  var hrefGame =ggUrls.removeLeadingSlash(ggUrls.game(data.game.slug));
  var gameMainAction =data.gameMainAction;
  var challenge =data.challenge;

  lmNotifyHelpers.separateUsers({type:type, userIds: userIds, notifId:notifId, noBulk:true}, function(retSep) {

    var maxLen =75;
    var messageTitle = challenge.mediaMessage ?
     ( ( challenge.mediaMessage.length > maxLen ) ?
     challenge.mediaMessage.slice(0, maxLen) : challenge.mediaMessage )
     : null;
    var title = messageTitle || ( userName + " Motivation for " + gameMainAction );
    var mediaHtml ="";
    if( challenge.media ) {
      if( challenge.mediaType === 'image' ) {
        mediaHtml += "<img src='" + challenge.media + "' style='max-width: 480px;' />";
      }
      else {
        mediaHtml += challenge.media;
      }
      mediaHtml +="<br /><br />";
    }
    if( challenge.mediaMessage ) {
      mediaHtml += userName + " says: \"" + challenge.mediaMessage + "\"<br /><br />";
    }
    var message = userName + " did " + gameMainAction + ". Have you done yours?";
    var messageEmail = mediaHtml + message;

    var inAppData =false;
    var pushData ={
      title: title,
      text: message
    };
    var emailData ={
      subject: title,
      html: messageEmail
    };
    var smsData =false;

    lmNotify.sendAll(retSep.users, inAppData, pushData, emailData, smsData, {});

  });
};

lmNotifyTypes.gameBuddyAdded =function(type, data, params) {
  var notifId =type;

  var userIds =data.notifyUserIds;
  var buddyUserName =data.buddyUser.profile.name;
  var gameName =data.game.title;
  var gameUrl =ggUrls.game(data.game.slug);
  var hrefGame =ggUrls.removeLeadingSlash(gameUrl);
  var gameFullUrl =Config.appInfo().shortRootUrl + gameUrl;

  lmNotifyHelpers.separateUsers({type:type, userIds: userIds, notifId:notifId, noBulk:true}, function(retSep) {

    var title ="Challenge Buddy Accepted";
    var message =buddyUserName + ' is now your buddy for ' + gameName + '.';
    var inAppData ={
      subject: title,
      html: message,
      notificationType: type,
      linkUrlPart: hrefGame
    };
    var pushData ={
      title: title,
      text: message
    };
    var emailData ={
      subject: title,
      html: "Congratulations! " + buddyUserName + " is now your buddy for " + gameName + "."+
        "<br /><br />"+
        "Buddies are very important in the Growth & Giving Challenges and come with one key responsibility:"+
        "<br />"+
        "1. A daily call (or text) to your buddy when you complete your daily pledge to let them know you completed yours and to remind and encourage your buddy to complete theirs."+
        "<br />"+
        "As buddies, your job is to ensure neither one of you misses a single day!"+
        "<br /><br />"+
        "Enjoy the challenge and see what you and your buddy can achieve together!"+
        "<br /><br />"+
        gameFullUrl
    };
    var smsData =false;

    lmNotify.sendAll(retSep.users, inAppData, pushData, emailData, smsData, {});

  });
};

lmNotifyTypes.gameBuddyRequest =function(type, data, params) {
  var notifId =type;

  var userIds =data.notifyUserIds;
  var userName =data.user.profile.name;
  var gameName =data.game.title;
  var gameUrl =ggUrls.game(data.game.slug, { buddyRequestKey: data.buddyRequestKey });
  var hrefGame =ggUrls.removeLeadingSlash(gameUrl);
  var gameFullUrl =Config.appInfo().shortRootUrl + gameUrl;

  lmNotifyHelpers.separateUsers({type:type, userIds: userIds, notifId:notifId, noBulk:true}, function(retSep) {

    var title ="Challenge Buddy Request";
    var message =userName + ' wants to be your buddy for ' + gameName + '.';
    var inAppData ={
      subject: title,
      html: message,
      notificationType: type,
      linkUrlPart: hrefGame
    };
    var pushData ={
      title: title,
      text: message
    };
    var emailData ={
      subject: title,
      html: "Lucky you! " + userName + " would like to play " + gameName + " with you, as your one and only buddy."+
        "<br /><br />"+
        "Buddies are very important in the Growth & Giving Challenges and come with one key responsibility:"+
        "<br />"+
        "1. A daily call (or text) to your buddy when you complete your daily pledge to let them know you completed yours and to remind and encourage your buddy to complete theirs."+
        "<br />"+
        "As buddies, your job is to ensure neither one of you misses a single day!"+
        "<br /><br />"+
        "Enjoy the challenge and see what you and your buddy can achieve together!"+
        "<br /><br />"+
        gameFullUrl
    };
    var smsData =false;

    lmNotify.sendAll(retSep.users, inAppData, pushData, emailData, smsData, {});

  });
};

lmNotifyTypes.gameChallengeDueReminder =function(type, data, params) {
  var notifId =type;

  var userIds =data.notifyUserIds;
  var buddyUserName =data.buddyUser ? data.buddyUser.profile.name : null;
  var gameName =data.game.title;
  var gameMainAction =data.gameMainAction;
  var gameUrl =ggUrls.game(data.game.slug);
  var hrefGame =ggUrls.removeLeadingSlash(gameUrl);
  var gameFullUrl =Config.appInfo().shortRootUrl + gameUrl;

  var inspirationHtml =null;
  if( data.inspiration ) {
    inspirationHtml ="<br /><br />" +
      "Need some inspiration?" +
      "<br />";
    if( data.inspiration.type === 'image' ) {
      inspirationHtml += "<img src='" + data.inspiration.content + "' style='max-width: 480px;' />";
    }
    if( data.inspiration.type === 'video' ) {
      inspirationHtml += data.inspiration.content;
    }
    if( data.inspiration.type === 'quote' ) {
      inspirationHtml += data.inspiration.content;
    }
    inspirationHtml += "<br />";
  }

  lmNotifyHelpers.separateUsers({type:type, userIds: userIds, notifId:notifId, noBulk:true}, function(retSep) {

    var title ="Challenge Due";
    var message =buddyUserName ? ( "You and your buddy " + buddyUserName + " have not both" ) : ( "You have not" ) + " done today's challenge for " + gameName + ".";
    var inAppData =false;
    var pushData ={
      title: title,
      text: message
    };
    var emailData ={
      subject: title,
      html: "Here's a friendly reminder for you " + ( buddyUserName ? ( "and your buddy " + buddyUserName ) : "" ) + " to do your " + gameMainAction + " for today and then log them at the link below!"+
        "<br /><br />" +
        gameFullUrl +
        ( inspirationHtml ? inspirationHtml : '' )
    };
    var smsData =false;

    lmNotify.sendAll(retSep.users, inAppData, pushData, emailData, smsData, {});

  });
};

lmNotifyTypes.gameJoinNextWeekReminder =function(type, data, params) {
  var notifId =type;

  var userIds =data.notifyUserIds;
  var gamesUrl =ggUrls.games();
  var hrefGames =ggUrls.removeLeadingSlash(gamesUrl);
  var gamesFullUrl =Config.appInfo().shortRootUrl + gamesUrl;
  // var gameStreak =data.weekStreakCurrent.amount;
  var gameStreak =data.weekStreakCurrent;

  lmNotifyHelpers.separateUsers({type:type, userIds: userIds, notifId:notifId, noBulk:true}, function(retSep) {

    // var streakText =( ( gameStreak > 0) ? ( "Keep your challenge streak of " + gameStreak
    //  + " challenge" + ( ( gameStreak === 1 ) ? "" : "s" ) + " alive" ) :
    //  ( "Start a new challenge streak" ) );
    // var title = ( gameStreak > 0 ) ? "Keep Your Challenge Streak Alive" : "Join Challenge Reminder";
    var streakText = gameStreak ? ( "Keep your challenge streak alive" ) :
     ( "Start a new challenge streak" );
    var title = gameStreak ? "Keep Your Challenge Streak Alive" : "Join Challenge Reminder";
    var message =streakText + " by joining a challenge this week.";
    var inAppData =false;
    var pushData ={
      title: title,
      text: message
    };
    var emailData ={
      subject: title,
      html: message +
        "<br /><br />"+
        gamesFullUrl
    };
    var smsData =false;

    lmNotify.sendAll(retSep.users, inAppData, pushData, emailData, smsData, { emailToField: 'bcc' });

  });
};