const getScoreboard = () => {
    // we also need the current date to retrieve todays game api
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var masterscoreboard = `http://mlb.mlb.com/gdcross/components/game/mlb/year_${yyyy}/month_${mm}/day_${dd}/master_scoreboard.json`; 
    // var masterscoreboard = `http://mlb.mlb.com/gdcross/components/game/mlb/year_2019/month_09/day_08/master_scoreboard.json`;
    return masterscoreboard;
};

module.exports = {
    getScoreboard
};
