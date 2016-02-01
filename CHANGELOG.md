Each entry (version) should have a date and one or more of 3 sections: 'Features', 'Bug Fixes', 'Breaking Changes'. Make sure to `git tag` the commit to match the version. Sub / pre-release versions should be hypenated (i.e. 1.0.3-2).

# 1.2.12

## Features

- Add image picker for user profile and save game
  - Add button-group styles.
  - Add s3 package for deleting Amazon S3 objects.


# 1.2.11

## Bug Fixes

- Ensure `updatedAt` set in `userGames` for media update when completing a challenge.

## Features

- Make game awards user link go to challenge log instead of user profile.
- Add game user timeline to user profile page.
- Refactor user profile to have secondary (sub) nav.
- Go to games suggest after last challenge completion FIRST, before game summary.


# 1.2.10

## Features

- Process challenge media simultaneously, in background, to avoid slow loading times (for video uploads).
- Add in challenge video documentation / buddy motivation.


# 1.2.9

## Features

- add game-challenge-log page.
- add in challenge media privacy.


# 1.2.8

## Features

- Send buddy motivation notification on challenge completion if media.
- Make action goal optional and remove from game display.
- Put back in awards.


# 1.2.7

## Features

- Change all 'game' to 'challenge'.
- Remove 'reach' - switch to 'team'.
- Simplify game page. Remove awards and impact sections.


# 1.2.6

## Features

- Remove `gratitude` game type to simplify.


# 1.2.5

## Features

- Add Game Suggest Form that sends email, rather than a direct mailto: link for game suggesting.
- Add banner log it button to game page if have not logged the challenge for the day.
- Better error message if try to join game and are already in game.


# 1.2.4

## Features

- Support .gif image files.
- Show image preview for inspirational image url.


# 1.2.3

## Features

- Add buddy requesting.