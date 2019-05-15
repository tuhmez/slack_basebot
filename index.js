import { botToken } from './slackBotToken';

const SlackBot = require('slackbots');
const axios = require('axios');
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
  // bot.postMessageToChannel(desiredChannel, 'Basebot is warmed up and ready to hit some dingers. If you need help, type \'@basebot help\'');
  bot.postMessageToGroup(testingGroup, 'Basebot is warmed up and ready to hit some dingers. If you need help, type \'@basebot help\'');
});

// error handler
bot.on('error', (err) => console.log('['+new Date().toString() +']' + ' ' + err));

// message handler
bot.on('message', data => {
  if(data.username == 'basebot' || data.type !== 'message' || !data.text.includes(botId)){
    return;
  }
  else if (data.text.includes(botId) && data.type == 'message'){
    var actualText = data.text.replace(botId, "");
    handleMessage(actualText);
  }
});

function checkTime(){
  // we also need the current date to retrieve todays game api
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  masterscoreboard = `http://mlb.mlb.com/gdcross/components/game/mlb/year_${yyyy}/month_${mm}/day_${dd}/master_scoreboard.json`; 
  // masterscoreboard = `http://mlb.mlb.com/gdcross/components/game/mlb/year_2019/month_04/day_23/master_scoreboard.json`; 
}

function handleMessage(message){
  checkTime();

  if(message.includes('score')){
    var team = message.replace("score", "").trim().toLowerCase();
    getGames(team);
  }
  else if(message.includes('games')){
    getGames("all");
  }
  else if(message.includes('boxscore')){
    // getGames("boxscore");
  }
  else if(message.includes('help')){
    botHelp();
  }
}

function checkScore(gamesFound, isBoxscoreRequest){
var currentGame; // the current game
var gameTime; // first pitch time
var gameTimeZone; // timezone of first pitch
var gameStatus; // the status of the game (preview, pre-game, in-progress, final)
var gameInning; // the inning of the game
var inningStatus; // either the top or the bottom of inning

var homeTeam;
var homeScore;

var awayTeam;
var awayScore;

var scoreMessage = "";
if(gamesFound.length == 0){
  errorHandler('No game(s) found for entered team(s). Maybe they have a day off?'
  + '\nCurrently basebot accepts teams name, not location of team, and all for all games; so make sure proper team name is used.');
  return;
}

for(var i = 0; i < gamesFound.length; i++){

  currentGame = gamesFound[i];
  awayTeam = currentGame.away_team_name;
  homeTeam = currentGame.home_team_name
  gameStatus = currentGame.status.status;
  gameTime = currentGame.time;
  gameTimeZone = currentGame.time_zone;

  if(!isBoxscoreRequest){
    if(gameStatus === 'Preview' || gameStatus === 'Pre-Game'){
      scoreMessage += `${gameStatus} | ${awayTeam} vs. ${homeTeam} | First Pitch: ${gameTime} ${gameTimeZone}\n`;
    } else {
      gameInning = currentGame.status.inning;
      inningStatus = currentGame.status.inning_state;

      homeScore = currentGame.linescore.r.home;
      awayScore = currentGame.linescore.r.away;

        if (gameStatus === 'Game Over' || gameStatus === 'Final'){
          scoreMessage += `FINAL | ${awayTeam}: ${awayScore} vs. ${homeTeam}: ${homeScore}\n`;
        } else {
          scoreMessage += `SCORE | ${gameStatus} | ${inningStatus} ${gameInning} | ${awayTeam}: ${awayScore} vs. ${homeTeam}: ${homeScore}\n`;
        }
      }
    }
    else {
      
    }
  }

  // bot.postMessageToChannel(desiredChannel, scoreMessage);
  bot.postMessageToGroup(testingGroup, scoreMessage);
}

/// Parameter | Type: either a specific team or 'all' which will return all of the games on a prescribed date (for now today)
function getGames(type){
  axios.get(masterscoreboard)
  .then(res => {
    //api structure
    var mlbGames = res.data.data.games.game;
    var currentGame; // the current game
    var gameMatches = [];

    // since the api shortens diamondbacks to d-backs, we need to catch this
    if(type === 'diamondbacks'){
      type = 'd-backs';
    }
    for(var i = 0; i < mlbGames.length; i++){
      currentGame = mlbGames[i];
      var currentHomeTeam = currentGame.home_team_name.toLowerCase();
      var currentAwayTeam = currentGame.away_team_name.toLowerCase();

      if(currentHomeTeam === type || currentAwayTeam === type){
        gameMatches.push(currentGame);
      }
      else if (type === 'all'){
        gameMatches.push(currentGame);
      }
    }

    var isBoxscoreRequest = false;

    if(type === 'boxscore'){
      isBoxscoreRequest = true;
    }

    checkScore(gameMatches, isBoxscoreRequest);
  })
}

function botHelp(){

    var helpMessage = 'Basebot currently supports the following commands:' + 
    '\n{desired-team-name} score: input your favorite team\'s name to get a game status and score, if game is in progress' +
    '\ngames: retrieve all games from today and see the live scores across the league';
   
    // bot.postMessageToChannel(desiredChannel, helpMessage);
    bot.postMessageToGroup(testingGroup, helpMessage);
}

function errorHandler(error){
  // bot.postMessageToChannel(desiredChannel, error);
  bot.postMessageToGroup(testingGroup, error);
}