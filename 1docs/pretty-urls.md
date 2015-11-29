# Pretty URLs

We want to make memorable, short URLs when possible. The "all G" theme is
 cool, but makes short urls more difficult. We'll use, in priortized order:

It would be nice to have ALL urls short and pretty though sometimes short comes
 at a cost of less memorable (since it is abbreviations) and we want to save
 short urls to try to keep things to one or two character namespaces. So only
 use as necessary (when the URL is likely to be publicly shared).

- Game: /g/:gameSlug
  - Bob wants to play with you; join at /g/:gameSlug
- Game Challenge Completion: /gc/:gameSlug
  - Ann completed her challenge; complete yours at /gc/:gameSlug
- [x] Game Rule: /gr/:gameRuleSlug
- User Games: /ug/:username
- User: /u/:username
- Group: /gp/:groupSlug
- Gift: /gf/:giftSlug
- User Gifts: /ugf/:username


Semi short

- Friends: /friends/:username
- Game Users: /game-users/:gameSlug
  - shows all users in a game (with completion totals)


Long / normal

- [x] save-game/[?slug=:gameSlug]
- [x] save-game-rule/[?slug=:gameRuleSlug]

- my-games

- games (view all - search /filter)
- game-rules (view all - search / filter)
- users (view all - search / filter)
- groups (view all - search / filter)
- gifts (view all - search / filter)