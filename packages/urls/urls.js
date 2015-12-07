ggUrls ={
};

ggUrls.img =function(type) {
  return type ? '/img/'+type+'/' : '/img/';
};

ggUrls.game =function(gameSlug) {
  return '/g/'+gameSlug;
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