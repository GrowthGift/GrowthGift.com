ggUrls ={
};

ggUrls.removeLeadingSlash =function(url) {
  return ( ( url[0] ==='/' ) ? url.slice(1, url.length) : url);
}

ggUrls.img =function(type) {
  return type ? '/img/'+type+'/' : '/img/';
};

ggUrls.faq =function() {
  return '/about/?nav=faq';
};

ggUrls.howItWorks =function() {
  return '/about/?nav=hiw';
};

ggUrls.game =function(gameSlug, params) {
  return '/g/'+gameSlug + (
   ( params && params.buddyRequestKey ) ? '?buddy='+params.buddyRequestKey :
   ( params && params.username ) ? '?user='+params.username :
   '' );
};

ggUrls.gameChallenge =function(gameSlug) {
  return '/gc/'+gameSlug;
};

ggUrls.gameInvite =function(gameSlug) {
  return '/gi/'+gameSlug;
};
ggUrls.gamePledge =function(gameSlug) {
  return ggUrls.gameInvite(gameSlug)+'?nav=pledge';
};
ggUrls.gameInviteBuddy =function(gameSlug) {
  return ggUrls.gameInvite(gameSlug)+'?nav=buddy';
};
ggUrls.gameInviteReach =function(gameSlug) {
  return ggUrls.gameInvite(gameSlug)+'?nav=reach';
};

ggUrls.gameRule =function(gameRuleSlug) {
  return '/gr/'+gameRuleSlug;
};

ggUrls.games =function() {
  return '/games';
};

ggUrls.gamesSuggest =function() {
  return '/games-suggest';
};

ggUrls.gameUsers =function(gameSlug) {
  return '/game-users/'+gameSlug;
};

ggUrls.gameUserSummary =function(gameSlug) {
  return '/game-user-summary/'+gameSlug;
};

ggUrls.myGames =function(view) {
  return (view ==='past') ? '/my-games?view=past' : '/my-games';
};

ggUrls.saveGameRule =function(gameRuleSlug) {
  return '/save-game-rule/?slug='+gameRuleSlug;
};

ggUrls.user =function(username) {
  return '/u/'+username;
};