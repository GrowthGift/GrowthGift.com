ggUrls ={
};

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
  return '/g/'+gameSlug +
   ( (params && params.buddyRequestKey) ? '?buddy='+params.buddyRequestKey :
   '' );
};

ggUrls.gameChallenge =function(gameSlug) {
  return '/gc/'+gameSlug;
};

ggUrls.gameInvite =function(gameSlug) {
  return '/gi/'+gameSlug;
};

ggUrls.gameRule =function(gameRuleSlug) {
  return '/gr/'+gameRuleSlug;
};

ggUrls.gameUsers =function(gameSlug) {
  return '/game-users/'+gameSlug;
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