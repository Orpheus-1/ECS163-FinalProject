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

let heatmapMargin = {top: 10, right: 10, bottom: 10, left: 10}
let heatmapTop = 500
let heatmapLeft = 600
let heatmapWidth = 50 + heatmapLeft
let heatmapHeight = 50 + heatmapTop


// read the raw data from csv to plot
let data = d3.csv("california.csv").then (rawData => {
    let yearDict = {}

    rawData.forEach(element => {
        if (element.FIRE_YEAR in yearDict) {
            yearDict[element.FIRE_YEAR].push(element)
        } else {
            yearDict[element.FIRE_YEAR] = []
        }
        
    });
    return yearDict

}).catch(function(error){
    console.log(error);
});

console.log(data)

d3.json("caliCounties.geojson").then (counties => {
    console.log(counties)

    let county = counties.features.filter(county => county.properties.NAME === "Sacramento")[0]
    console.log(county)

    let projection = d3.geoMercator().fitExtent([[heatmapLeft, heatmapTop], [heatmapWidth, heatmapHeight]], county)

    let pathGen = d3.geoPath().projection(projection)

    let mapPath = pathGen(county)
    console.log(mapPath)

    let svg = d3.select("svg")
        
    counties.features.forEach(county => {
        svg.append('path')
            .datum(county)
            .attr("d", pathGen)
            .attr('fill', 'none')
            .attr('stroke', '#999999')
            .attr('stroke-width', '2')

    })

})






