if(Meteor.isServer) {

  SyncedCron.config({
    utc: true
  });

  SyncedCron.add({
    name: 'Notifications Bulk Sending',
    schedule: function(parser) {
      // parser is a later.parse object
      // var text ='at 10:00 am on Sun';
      // var text ='every 10 seconds';   //TESTING
      // var text ='every minute';
      // var text ='every 2 minutes';
      // return parser.text(text);
      return parser.cron('* * * * * *');    // every minute
    },
    job: function() {
      return lmNotify.bulkSend();
    }
  });

  SyncedCron.add({
    name: 'Cache GameChallengeDue Forming',
    schedule: function(parser) {
      // return parser.cron('* * * * * *');    // every minute
      // once an hour - this should NOT run at the same time as the challenge
      // due notifications runs as that depends on this data to exist.
      return parser.cron('56 * * * * *');
    },
    job: function() {
      return ggReminder.formGameChallengeDueCache();
    }
  });

  SyncedCron.add({
    name: 'Notifications Game Challenge Due',
    schedule: function(parser) {
      // return parser.cron('* * * * * *');    // every minute
      return parser.cron('*/15 * * * * *');    // every 15 minutes
    },
    job: function() {
      return ggReminder.gameChallengeDue();
    }
  });

  SyncedCron.add({
    name: 'Save Game User Awards',
    schedule: function(parser) {
      // return parser.cron('* * * * * *');    // every minute
      return parser.cron('04 01 * * * *');    // once a day at 1:04am
    },
    job: function() {
      return ggGame.saveGameUserAwardsFinal();
    }
  });

  SyncedCron.start();
}