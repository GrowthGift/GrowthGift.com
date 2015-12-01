ggUrls ={
};

ggUrls.game =function(gameSlug) {
  return '/g/'+gameSlug;
};

ggUrls.gameUsers =function(gameSlug) {
  return '/game-users/'+gameSlug;
};

ggUrls.myGames =function(view) {
  return (view ==='past') ? '/my-games?view=past' : '/my-games';
}