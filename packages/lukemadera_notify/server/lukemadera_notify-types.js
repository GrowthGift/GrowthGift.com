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
   
    /*
    var streakText = gameStreak ? ( "Keep your challenge streak alive" ) :
     ( "Start a new challenge streak" );
    var title = gameStreak ? "Keep Your Challenge Streak Alive" : "Join Challenge Reminder";
    var message =streakText + " by joining a challenge this week.";
    */
	var title = "Keep the challenge going!";	//Change this
	var message = '';
	var ii;
	var xx;
	
	var max_games_featured_next = 2;
	var max_games_featured_past = 2;
	var max_award_winners = 2;
	var connector = '';
	
	
	
	if(data.nextGames && data.nextGames.length > 0)
	{
		message += 'Next week\'s games include ';
		if(data.nextGames.length === 1)
		{
			message += data.nextGames[0].title;
		}
		else if(data.nextGames.length === 2)
		{
			message += data.nextGames[0].title + ' and ' + data.nextGames[1].title;
		}
		else
		{
			connector = '';
			for(ii = 0; ii < data.nextGames.length && ii < max_games_featured_next; ii++)
			{
				message += connector + data.nextGames[ii].title;
				connector = ', ';
			}
			
			if(data.nextGames.length - max_games_featured_next > 0)
			{
				message += ', and ' + (data.nextGames.length - max_games_featured_next) + ' other games.';
			}
		}
	}
	
	if(data.pastGames && data.pastGames.length > 0)
	{
		message += '<br/><br/>This week on GrowthGift:<br/>';
		for(ii = 0; ii < data.pastGames.length && ii < max_games_featured_past; ii++)
		{
			message += data.pastGames[ii].challengeTotals.userActions + ' ' + data.pastGames[ii].gameRule.mainAction + ' completed by ' + data.pastGames[ii].challengeTotals.numUsers + ' players<br/>';
		}
		if(data.pastGames.length - max_games_featured_past > 0)
		{
			message += 'And ' + (data.pastGames.length - max_games_featured_past) + ' other games this week.';
		}
	}
	
	if(data.awards)
	{
		message += '<br/><br/>Congratulations to our award winners this week!';
		
		var loop_keys = {'perfectPledge': {'award_name': 'Marksman'}, 'perfectAttendance': {'award_name': 'Reliable'}, 'biggestImpact': {'award_name': 'Impact'}, 'biggestReach': {'award_name': 'Reach'}};
		
		for(xx in loop_keys)
		{
			if(data.awards[xx] && data.awards[xx].length > 0)
			{
				message += '<br/>' + loop_keys[xx].award_name + ' Award: ';
				
				connector = '';
				for(ii = 0; ii < data.awards[xx].length && ii < max_award_winners; ii++)
				{
					message += connector + data.awards[xx][ii].profileName;
					connector = ' & ';
				}
				if(data.awards[xx].length - max_award_winners > 0)
				{
					message += '. And ' + (data.awards[xx].length - max_award_winners) + ' other winners.';
				}
			}
		});
	}
	
	message += '<br/><br/>Join in the challenges next week at GrowthGift!';
	
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