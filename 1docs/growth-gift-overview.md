# Overview


## Slogans

Grow together.

Enabling growth and connection.
Empowering growth through connection.


## Goal

Help people connect (online) face to face to grow and give together.
Make the biggest possible positive difference - by involving as many people
 as possible to give and grow together.
Empower anyone to give (teach) by matching them with a network of people
 who want to grow (learn) what that person wants to give (teach).
And on the growth side, use interaction, connection, and friendly competition
 to help people grow more and faster.


## How?

Get people thinking about, on a daily basis, how they want to grow and give.
 By collecting and tracking this information, we build a database of growers
 and givers. We can then connect people who either want to grow in the same
 way (they can grow together) or where one person wants to give what other
 people want to grow in. It's simple matching. Online dating for service and
 personal improvement. The bigger the database we can amass of growth and
 giving goals, the more connections we can make.
Once we get 15 to 30 "growers" and 1 "giver" for a particular topic / skill
 / gift, we will suggest they use an online learning platform such as OneRoom
 for the giver to teach the growers.

High level: 1. G Games, 1.5. next steps (for giving & growing), 2. connecting
 people to achieve those next steps.
Next steps and journaling used to be key parts though we're shifting to an
 active focus - less about self writing and tracking and more about DOING.
 Less thinking and planning and more about taking that next step NOW, via
 playing a game / challenging friends and strangers to one of either: Growth
 Games, Giving Games, Gratitude Games.
The Games is more of the daily, small scale stuff - anyone can participate and
 it's about getting as many people involved as possible and about building
 habits. The Gifts is a more personalized, longer term goal focus - in
 addition to playing the Games on a daily / weekly basis, what are some month
 or year long giving or growth goals? Then we work to connect them with others
 to make those goals turn into reality. So it's all in the same vein, just a
 question of scale (how long the goal takes to complete) and personalization.


## More specifics


### Social

People (relationships) is the key and has to be baked in from the start. For
 the Games, this is pretty obvious - it's all about getting as many people as
 possible.
But for gifts it's less directly actionable and social. So for Gifts, each
 action or "list addition" should ideally invole another person (or two) in
 in some way, even if just a mention of being grateful for that person.
 It's all about connection, and connection means building and strengthening
 relationships, so everything should be aimed toward that. Personal growth is
 the one potential exception as you can grow alone. Though we want to encourage
 "group growth" - growing with other people. And that's where more of our value
 is - while our tracking and measurement helps, people don't need an app or
 website to track their own growth or to grow.

The business case for baked in social interaction is pretty obvious - virality.
 Encourage people to recruit their friends. Ask WHO they'd like to give or grow
 with.


### Solo value

Originally the ideas of a G3 Journal (Gratitude, Grow, Give) and next steps
 (breaking Gifts down into smaller, 1 hour or less tasks) was an idea for
 this but now it's all social based with the Games. The idea is that people
 are supposed to recruit a friend (or stranger) to start playing, so they
 don't need any existing people on the app for it to have value. So it's no
 longer aimed to be USED much solo, but should be able to be STARTED solo,
 and that's the most important thing. Don't want people waiting to use it
 until their friends do.
Next steps may be added back in later as a natural lead in to a daily OneRoom
 class to take to work toward achieving that goal.

More original thoughts on solo value:
I keep a gratitude journal myself and haven't been good about doing it daily so
 I'd appreciate and use an app to journal in and that reminded me and encouraged
 me to do it regularly. This could also lead into preparing nice heart felt
 gifts to people (a month of all the things I'm grateful for about my Mom / 
 significant other / etc.) as well as personal perspective of all the growth,
 giving, and happy memories someone has had over the months / years.


### The G(3) Games

Challenge a friend (or strangers) to grow, give, or practice gratitude with
 you for a week. These are more of the lifestyle / habit focused things to
 do on a daily basis, though they CAN be a (step of a) "gift" (growth goal
 , give goal). Anyone can create a new challenge and we'll pre-seed challenges
 with things like "random acts of kindness".
These will be the primary way to try to make the app go viral and take off.
 We'll publicize it by asking friends and strangers to join a weekly
 challenge with us or with their own friends.
Then once they have downloaded and are using the app, we'll encourage them
 to fill out their profile (grow & give goals, strengths),
 as well as to keep up the weekly challenges each week, ideally adding in
 new people each week. "Join the movement to help the world be more giving, 
 grateful, and grow together." "How can you help make the biggest possible
 positive difference?"


### Database schema

- games
  - give
    - optional WHO you gave with
  - grow
    - optional WHO helped you grow today / in this way?
  - grateful
    - WHO: thank someone
- gifts (skills)
  - grow / want (how I want to grow)
    - WHO do you want grow with?
    - next steps (link to another gift want, but smaller in scope)
    - optional why? (tell your story)
  - level / have (strengths, things I could give)
    - optional WHO helped you achieve this / gain this gift?
  - give / share (how I want to give)
    - optional WHO you want to give with
    - next steps (link to another gift share, but smaller in scope)
    - optional why? (tell your story)

Each gift thus has 3 core attributes, which are a combination of your strengths
 and passions. 1. your (current) "level" (strength) at that gift as well as how
 passionate you are about 2. giving (teaching) it and about 3. growing
 (improving) it.


## Starting Out - KISS

Keep It Simple, Stupid.
In the beginning, ALL games will be 1 week long with one (SAME) challenge per day.
 Keep flexibility in the database schema for adding variety later, but start
 simple. Less user decisions and quicker time to playing an actual game.

