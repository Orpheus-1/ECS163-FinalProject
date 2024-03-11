// Imports 
import { codeToCountyMap } from "./codeToCountyMap";

// changed to fit the screen of a standard 1920x1080 monitor
const width = 1920 * .9;
const height = 1080 * .7; 

let heatmapMargin = {top: 10, right: 10, bottom: 10, left: 10}
let heatmapTop = 400
let heatmapLeft = 400
let heatmapWidth = 50 + heatmapLeft
let heatmapHeight = 50 + heatmapTop



// read the raw data from csv to plot
d3.csv("california.csv").then (rawData => {
    let yearDict = {}
    console.log(rawData)
    rawData.forEach(element => {
        if (element.FIRE_YEAR in yearDict) {
            let countyName= codeToCountyMap[element.FIPS_CODE]

            if (countyName in yearDict[element.FIRE_YEAR]) {
                yearDict[element.FIRE_YEAR][countyName].push(element)
            } else {
                yearDict[element.FIRE_YEAR][countyName] = []
            }

        } else {
            yearDict[element.FIRE_YEAR] = {}
        }
        return
    });

    console.log(yearDict)

    const myColor = d3.scaleLinear()
    .range(["white", "red"])
    .domain([0, 100]) // Max Fire Count in dictionary

    d3.json("caliCounties.geojson").then (counties => {
        let selectedYearData = yearDict["2000"] // ToDo Adjust when using html input box selection.

        console.log(counties)

        // Select Our Root coordinate to build map upon
        let county = counties.features.filter(county => county.properties.NAME === "Sacramento")[0]
        console.log(county)

        // Handle placement of points on SVG
        let projection = d3.geoMercator().fitExtent([[heatmapLeft, heatmapTop], [heatmapWidth, heatmapHeight]], county)
        let pathGen = d3.geoPath().projection(projection)

        let svg = d3.select("svg")
            
        counties.features.forEach(county => {
            svg.append('path')
                .datum(county)
                .attr("d", pathGen)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', '2')

        })

    })


}).catch(function(error){
    console.log(error);
});



