const getScoreboard = (dd, mm, yyyy) => {
    var masterscoreboard = `http://mlb.mlb.com/gdcross/components/game/mlb/year_${yyyy}/month_${mm}/day_${dd}/master_scoreboard.json`; 
    return masterscoreboard;
};

const getCurrentDate = () => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var date = {
        day: dd,
        month: mm,
        year: yyyy
    };
    return date;
};

module.exports = {
    getScoreboard,
    getCurrentDate
};
