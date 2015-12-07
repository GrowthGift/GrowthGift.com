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

  // SyncedCron.start();
}