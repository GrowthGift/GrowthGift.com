ggFeedback ={
  prompts: [
    {
      q: "What was your favorite part of this game?",
      tags: ['game']
    },
    {
      q: "What was 1 memorable moment of this game?",
      tags: ['game']
    },
    {
      q: "What was 1 personal success in this game?",
      tags: ['game']
    },
    {
      q: "What is 1 way you improved during this game?",
      tags: ['game']
    },
    {
      q: "What was the hardest part of this game for you?",
      tags: ['game']
    },
    // Too feedback-y - keep them as shareable, positive stories
    // {
    //   q: "What is 1 way you would change the game for next time?",
    //   tags: ['game']
    // },
    // {
    //   q: "What is 1 thing your buddy did during this game that you're proud of?",
    //   tags: ['game','buddy']
    // },
    {
      q: "What is 1 piece of praise you would like to give to your buddy for this game?",
      tags: ['game','buddy']
    }
  ]
};

ggFeedback.getGamePrompts =function(buddy) {
  return ggFeedback.prompts.filter(function(prompt) {
    return ( prompt.tags.indexOf('game') >-1 &&
     ( buddy || prompt.tags.indexOf('buddy') <0) ) ? true : false;
  });
};

ggFeedback.getRandomGamePrompt =function(buddy) {
  var prompts =ggFeedback.getGamePrompts(buddy);
  var index =Math.floor(Math.random() * (prompts.length - 0)) + 0;
  return prompts[index];
}