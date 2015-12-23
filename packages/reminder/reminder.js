ggReminder ={};

/**
3 types of game reminders:
1. game-choose-buddy - every 24 hours if do not have one yet UNTIL game starts,
 at which point the daily challenge reminders will handle this.
2. game-started - once, when game starts.
3. game-challenge-due - once per challenge (day) IF the user has not completed
 their pledge for the challenge / day yet.
*/

/**
For performance we will create a caching collection for this (i.e. once per
 day) and then just run through that (each minute) to send notifications as
 necessary.
*/
ggReminder.formGameChallengeDueCache =function() {

};

ggReminder.gameChallengeDue =function() {
};

// ggReminder.gameStart =function() {
  
// };