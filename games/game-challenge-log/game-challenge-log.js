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
      if(!game || !gameRule || !userMain || !userGames ||
       ( buddyId && ( userGames.length < 2 || !userBuddy ) ) ) {
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

      var challenges =ggGame.getUserChallengeLog(game, gameRule, userGame,
       null, userGameBuddy, Meteor.user(), userMain, userBuddy);

      var links ={
        game: ggUrls.game(game.slug),
        gameUsers: ggUrls.gameUsers(game.slug),
        userMain: ggUrls.user(userMain.username),
        userBuddy: userBuddy ? ggUrls.user(userBuddy.username) : null,
      };
      var helperData ={
        userMain: userMain,
        userBuddy: userBuddy,
        gameMainAction: gameRule.mainAction,
        links: links,
        challenges: challenges
      };
      Template.instance().data.helperData =helperData;

      return {
        game: game,
        noChallenges: ( !challenges || !challenges.length ) ? true : false,
        links: links
      };
    }
  });

  Template.gameChallengeLogUser.helpers({
    data: function() {
      if(this.data) {
        var helperData ={
          userMain: this.data.userMain,
          userBuddy: this.data.userBuddy,
          gameMainAction: this.data.gameMainAction
        };
        Template.instance().data.helperData =helperData;
      }
      return this.data;
    }
  });
}