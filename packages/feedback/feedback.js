ggFeedback ={
  prompts: [
    {
      q: "What was your favorite part of this challenge?",
      tags: ['challenge']
    },
    {
      q: "What was 1 memorable moment of this challenge?",
      tags: ['challenge']
    },
    {
      q: "What was 1 personal success in this challenge?",
      tags: ['challenge']
    },
    // {
    //   q: "What is 1 way you improved during this challenge?",
    //   tags: ['challenge']
    // },
    {
      q: "What is 1 positive outcome of this challenge for you?",
      help: "A way you improved, something you got out of the challenge, etc.",
      tags: ['challenge']
    },
    {
      q: "What was the hardest part of this challenge for you?",
      tags: ['challenge']
    },
    // Too feedback-y - keep them as shareable, positive stories
    // {
    //   q: "What is 1 way you would change the challenge for next time?",
    //   tags: ['challenge']
    // },
    // {
    //   q: "What is 1 thing your buddy did during this challenge that you're proud of?",
    //   tags: ['challenge','buddy']
    // },
    {
      q: "What is 1 piece of praise you would like to give to your buddy for this challenge?",
      tags: ['challenge','buddy']
    }
  ]
};

ggFeedback.getGamePrompts =function(buddy) {
  return ggFeedback.prompts.filter(function(prompt) {
    return ( prompt.tags.indexOf('challenge') >-1 &&
     ( buddy || prompt.tags.indexOf('buddy') <0) ) ? true : false;
  });
};

ggFeedback.getRandomGamePrompt =function(buddy) {
  var prompts =ggFeedback.getGamePrompts(buddy);
  var index =Math.floor(Math.random() * (prompts.length - 0)) + 0;
  return prompts[index];
}