const SlackBot = require('slackbots');
const process = require('process');

const { botToken } = require('../slackBotToken');
const { getScoreboard, getCurrentDate } = require('./utils/scoreboard');

const { getGames, checkScore } = require('./utils/gameCalculator');
const isTestRun = process.env.NODE_ENV === 'test' ? true : false;

const desiredChannel = 'we-are-the-10th-man';
const testingGroup = 'bottest';

const bot = new SlackBot({
  token: botToken,
  name: 'basebot'
});

var masterscoreboard;
var botId;

// start
bot.on('start', () => {

  // by obtaining a botId, we can strip the message text down to just the user generated messages
  botId = "<@" + bot.self.id + "> ";
  postMessage('Basebot is warmed up and ready to hit some dingers. If you need help, type \'@basebot help\'');
});

bot.on('close', () => {
  postMessage('Basebot shutting down! [' + new Date().toString() +']');
});

// error handler
bot.on('error', (err) => console.log('['+new Date().toString() +']' + ' ' + err));

// message handler
bot.on('message', data => {
  if(data.username == 'basebot' || data.type !== 'message' || 
     data.text == null || !data.text.includes(botId)) {
    return;
  }
  else if (data.text.includes(botId) && data.type == 'message'){
    var actualText = data.text.replace(botId, "");
    handleMessage(actualText);
  }
});

const postMessage = (msg) => {
  // if test run, post to test group
  if(isTestRun) {
    bot.postMessageToGroup(testingGroup, msg);
  } else {
    bot.postMessageToChannel(desiredChannel, msg);
  }
};

function handleMessage(message) {
  // strip the score from the message
  var stringArray = message.replace("score", "").trim().toLowerCase().split("  ");

  // retrieve the team from the substring
  var team = stringArray[0];
  
  // get the current date to pass if no date passed
  var currentDate = getCurrentDate();

  // get the user input string
  // TODO add in date validation
  var userInputString = '';
  if (stringArray.length > 1)
  {
    userInputString = stringArray[1];
  }
  var scoreboardDate = currentDate;

  if(userInputString)
  {
    var userDateArray = userInputString.split("/");
    scoreboardDate.day = userDateArray[1];
    scoreboardDate.month = userDateArray[0];
    scoreboardDate.year = userDateArray[2];
  }

  masterscoreboard = getScoreboard(scoreboardDate.day, scoreboardDate.month, scoreboardDate.year);
  
  if(message.includes('score')){
    getGames(masterscoreboard, team)
    .then(res => {
      var gameMatches = res.Matches;
      var boxscoreRequest = res.BoxscoreRequest;
      var requestedTeam = res.TeamRequested;
      postMessage(checkScore(gameMatches, boxscoreRequest, requestedTeam));
    });
  }
  else if(message.includes('games')){
    getGames(masterscoreboard, "all").then(res => {
      var gameMatches = res.Matches;
      var boxscoreRequest = res.BoxscoreRequest;
      var requestedTeam = res.TeamRequested;
      postMessage(checkScore(gameMatches, boxscoreRequest, requestedTeam));
    });
  }
  else if(message.includes('help')){
    postMessage(botHelp());
  }
}

function botHelp(){
  var helpMessage = 'Basebot currently supports the following commands:' + 
  '\n\n- {desired-team-name} score {date (MM/DD/YYYY) - optional}: input your favorite team\'s name to get a game status and score on today\'s date or ' +
  'any date input under the formal MM/DD/YYYY\n- games: retrieve all games from today and see the live scores across the league';
  return helpMessage;
}

module.exports = {
  postMessage
};
