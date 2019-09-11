const axios = require('axios');

/// Parameter | Type: either a specific team or 'all' which will return all of the games on a prescribed date (for now today)
const getGames = (masterscoreboard, type) => {
  
  var currentGame;
  var gameMatches = []; // all games that we want
  var isBoxscoreRequest = false; // if a boxscore is requested
  var requestedTeam = ""; // the team that we want to retrieve, unless we want all the scores
  
  var result;

  return new Promise((resolve, reject) => {
    axios.get(masterscoreboard)
    .then(res => {
      //api structure
      var mlbGames = res.data.data.games.game;
  
      // since the api shortens diamondbacks to d-backs, we need to catch this
      if(type === 'diamondbacks') {
        type = 'd-backs';
      }
      for(var i = 0; i < mlbGames.length; i++){
        currentGame = mlbGames[i];
        var currentHomeTeam = currentGame.home_team_name.toLowerCase();
        var currentAwayTeam = currentGame.away_team_name.toLowerCase();
  
        if(currentHomeTeam === type || currentAwayTeam === type){
          gameMatches.push(currentGame);
          requestedTeam = type;
        }
        else if (type === 'all'){
          gameMatches.push(currentGame);
          requestedTeam = type;
        }
      }
    
      if(type === 'boxscore'){
        isBoxscoreRequest = true;
      }

      result = {
        Matches: gameMatches,
        BoxscoreRequest: isBoxscoreRequest,
        TeamRequested: requestedTeam
      };
      resolve(result);
    })
    .catch(err => {
      console.log(err);
    });
  });

};

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

const checkScore = (gamesFound, isBoxscoreRequest, requestedTeam) => {
    
  var scoreMessage = "";
  if(gamesFound.length == 0){
    return('No game(s) found for entered team(s). Maybe they have a day off?' +
    '\nCurrently basebot accepts teams name, not location of team, for all games; so make sure proper team name is used.');
  }
    
  for(var i = 0; i < gamesFound.length; i++){
    
      currentGame = gamesFound[i];
      awayTeam = currentGame.away_team_name;
      homeTeam = currentGame.home_team_name;
      gameStatus = currentGame.status.status;
      gameTime = currentGame.time;
      gameTimeZone = currentGame.time_zone;
      
      if (gameStatus === 'Preview' || gameStatus === 'Pre-Game' || gameStatus === 'Warmup') {
        scoreMessage += `${gameStatus} | ${awayTeam} vs. ${homeTeam} | First Pitch: ${gameTime} ${gameTimeZone}\n`;
      } else {
        gameInning = currentGame.status.inning;
        inningStatus = currentGame.status.inning_state;
    
        homeScore = currentGame.linescore.r.home;
        awayScore = currentGame.linescore.r.away;
    
        if (gameStatus === 'Game Over' || gameStatus === 'Final'){
          scoreMessage += `FINAL | ${awayTeam}: ${awayScore} vs. ${homeTeam}: ${homeScore}\n`;
          if(requestedTeam !== 'all')
          {
            scoreMessage += getBoxScore();
          }
        } else {
          scoreMessage += `SCORE | ${gameStatus} | ${inningStatus} ${gameInning} | ${awayTeam}: ${awayScore} vs. ${homeTeam}: ${homeScore}\n`;
          if(requestedTeam !== 'all')
          {
            scoreMessage += getBoxScore();
          }
        }
      }
    }
      return(scoreMessage);
};

const getBoxScore = () => {
  var boxscore = '';

  var homeObj = {};
  var awayObj = {};

  for (var j = 0; j < currentGame.linescore.inning.length; j++)
  {
    var runData = currentGame.linescore.inning[j];
    var inning = parseInt(j + 1);

    homeObj[inning] = parseInt(runData.home);
    if ( homeObj[inning] === null || isNaN(homeObj[inning])) {
      homeObj[inning] = 0;
    }
    awayObj[inning] = parseInt(runData.away);
    if (awayObj[inning] == null || isNaN(awayObj[inning])) {
      awayObj[inning] = 0;
    }
  }
  var homeBoxScore = {
    Team: homeTeam,
    Runs: homeObj,
    TotalRuns: parseInt(currentGame.linescore.r.home),
    Hits: parseInt(currentGame.linescore.h.home),
    Errors: parseInt(currentGame.linescore.e.home)
  };
  var homeJson = JSON.stringify(homeBoxScore, null, 4);
  var awayBoxScore = {
    Team: awayTeam,
    Runs: awayObj,
    TotalRuns: parseInt(currentGame.linescore.r.away),
    Hits: parseInt(currentGame.linescore.h.away),
    Errors: parseInt(currentGame.linescore.e.away)
  };
  var awayJson = JSON.stringify(awayBoxScore, null, 4);
  boxscore += awayJson + "\n" + homeJson;
  return(boxscore);
};

module.exports = {
    getGames,
    checkScore
};
