if(Meteor.isServer) {

  // SyncedCron.add({
  //   name: 'Payout service pros',
  //   schedule: function(parser) {
  //     // parser is a later.parse object
  //     var text ='at 10:00 am on Sun';
  //     // text ='every 10 seconds';   //TESTING
  //     return parser.text(text);
  //   },
  //   job: function() {
  //     console.log('cron: payout service pros starting');
  //     var retPayout =lmPayment.payout({});
  //     console.log(retPayout.msgJson);
  //     return retPayout;
  //   }
  // });

  // SyncedCron.start();
}