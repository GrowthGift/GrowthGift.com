if(Meteor.isClient) {

  Template.gameChallengeLog.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
  };

  Template.gameChallengeLog.helpers({
    data: function() {
      var game =(this.gameSlug && GamesCollection.findOne({slug: this.gameSlug}))
       || null;
      var gameRule =(game && GameRulesCollection.findOne({_id: game.gameRuleId}) )
       || null;
      var userMain = this.username ? Meteor.users.findOne({ username: this.username },
       { fields: { username: 1, profile: 1} }) : null;
      var gameUser =userMain ? ggGame.getGameUser(game, userMain._id, {}) : null;
      var buddyId = gameUser ? gameUser.buddyId : null;
      var userBuddy = buddyId ? Meteor.users.findOne({ _id: buddyId },
       { fields: { username: 1, profile: 1} }) : null;
      var userGames =( game && userMain ) ? UserGamesCollection.find({ gameId:game._id,
       userId: { $in: [ userMain._id, buddyId ] } }).fetch() : null;
      if(!game || !userMain) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var userGameIndex =_.findIndex(userGames, 'userId', userMain._id);
      var userGame =userGames[userGameIndex];
      var userGameBuddyIndex =buddyId ?
       _.findIndex(userGames, 'userId', buddyId) : -1;
      var userGameBuddy = ( userGameBuddyIndex > -1 ) ?
       userGames[userGameBuddyIndex] : null;

      Template.instance().data.helperData ={
        userMain: userMain,
        userBuddy: userBuddy,
        gameMainAction: gameRule.mainAction
      };

      var challenges =ggGame.getChallengesWithUser(game, gameRule, userGame, null, userGameBuddy).challenges;
      if( challenges && challenges.length ) {
        // Add in privileges
        var userId = Meteor.userId();
        var userIsMain = ( userId && userMain._id === userId ) ? true : false;
        var userIsBuddy = ( userId && userBuddy && userBuddy._id === userId ) ? true : false;
        var user =Meteor.user();
        challenges.forEach(function(challenge, index) {
          challenges[index].privileges ={
            userMainMedia: ( userIsMain || userIsBuddy || ( challenge.userMedia
             && challenge.userMedia.privacy === 'public' ) ) ? true : false,
            userBuddyMedia: ( userIsBuddy || userIsMain || ( challenge.buddyMedia
             && challenge.buddyMedia.privacy === 'public' ) ) ? true : false
          };
          challenges[index].timeDisplay = ( !challenge.started) ?
           ( "Starts " + msUser.toUserTime(user, challenge.start, null, 'from') )
           : ( challenge.started && !challenge.ended) ?
           ( "Ends " + msUser.toUserTime(user, challenge.end, null, 'from') )
           : ( "Ended " + msUser.toUserTime(user, challenge.end, null, 'from') );
        });
      }

      return {
        game: game,
        challenges: challenges,
        noChallenges: ( !challenges || !challenges.length ) ? true : false,
        userMain: userMain,
        userBuddy: userBuddy,
        links: {
          game: ggUrls.game(game.slug),
          gameUsers: ggUrls.gameUsers(game.slug),
          userMain: ggUrls.user(userMain.username),
          userBuddy: userBuddy ? ggUrls.user(userBuddy.username) : null,
        }
      };
    }
  });

}