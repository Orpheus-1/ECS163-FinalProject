// changed to fit the screen of a standard 1920x1080 monitor
const width = 1920 * .9;
const height = 1080 * .7; 

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 10, right: 50, bottom: 50, left: 100},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 50, bottom: 50, left: 100},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let teamLeft = 0, teamTop = 400;
let teamMargin = {top: 10, right: 30, bottom: 30, left: 60},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = height-450 - teamMargin.top - teamMargin.bottom;

// read the raw data from csv to plot
d3.csv("california.csv").then (rawData => {
    let yearDict = {}
    rawData.forEach(element => {
        if (element.FIRE_YEAR in yearDict) {
            yearDict[element.FIRE_YEAR].push(element)
        } else {
            yearDict[element.FIRE_YEAR] = []
        }
        
    });
    console.log(yearDict)

}).catch(function(error){
    console.log(error);
});

