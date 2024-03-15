
// changed to fit the screen of a standard 1920x1080 monitor
const width = 1920 * .9;
const height = 1080 * .7; 

let heatmapMargin = {top: 10, right: 10, bottom: 10, left: 10}
let heatmapTop = 250
let heatmapLeft = 400
let heatmapWidth = 50 + heatmapLeft
let heatmapHeight = 100 + heatmapTop

const codeToCountyMap = {
    "06001": "Alameda", 
    "06031": "Kings",
    "06061": "Placer",
    "06091": "Sierra",
    "06003": "Alpine",
    "06033": "Lake",
    "06063": "Plumas",
    "06093": "Siskiyou",
    "06005": "Amador",
    "06035": "Lassen",
    "06065": "Riverside",
    '06095': "Solano",	
    "06007": "Butte",
    "06037": "Los Angeles",
    "06067": "Sacramento",
    "06097": "Sonoma",
    "06009": "Calaveras",
    "06039": "Madera",
    "06069": "San Benito",
    "06099": "Stanislaus",
    "06011": "Colusa",
    "06041": "Marin",
    "06071": "San Bernardino",
    "06101": "Sutter",
    "06013": "Contra Costa",
    "06043": "Mariposa",
    "06073": "San Diego",
    "06103": "Tehama",
	"06015": "Del Norte",
    "06045": "Mendocino",
    "06075": "San Francisco",	 	
    "06105": "Trinity",
    "06017": "El Dorado",
    "06047": "Merced",
    "06077": "San Joaquin",
    "06107": "Tulare",
    "06019": "Fresno",
    "06049": "Modoc",
    "06079": "San Luis Obispo",
    "06109": "Tuolumne",
    "06021": "Glenn",
    "06051": "Mono",
    "06081": "San Mateo",
    "06111": "Ventura",
    "06023": "Humboldt", 
    "06053": "Monterey",
    "06083": "Santa Barbara",
    "06113": "Yolo",
    "06025": "Imperial",
    "06055": "Napa",
    "06085": "Santa Clara",
    "06115": "Yuba",
    "06027": "Inyo",
    "06057": "Nevada",
    "06087": "Santa Cruz",
    "06029": "Kern",
    "06059": "Orange",
    "06089": "Shasta", 	
}   

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

    let selectedYear = 1992
    // Append Year Selector

    console.log(yearDict)    
    


    const possibleYears = Object.keys(yearDict)
    // Append Select
    var select = d3.select("select")
        .style("font-size", "30px")


    select.on("change", d => {
        selectedYear = d3.select("select").property("value");
       // svg
       d3.selectAll("path").remove()
       drawMap()
    });
    
    select.selectAll("option")
    .data(possibleYears)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d)

    // GET MAX FIRE Count
    const yearDictValues = Object.entries(yearDict[selectedYear]) 
    let maxFiresSelectedYear = 0

    for (const [key, value] of yearDictValues) {
        if (key !== "undefined")
            maxFiresSelectedYear = Math.max(maxFiresSelectedYear, value.length)
    }

    function handleZoom(e) {
        console.log(e)

    }

    // Zooming
    let zoom = d3.zoom()
        .on('zoom', handleZoom)

    drawMap()

    function zoomToCounty() {

    }
    function drawMap() {

        // GET MAX FIRE Count
        const yearDictValues = Object.entries(yearDict[selectedYear]) 
        let maxFiresSelectedYear = 0
    
        for (const [key, value] of yearDictValues) {
            if (key !== "undefined")
                maxFiresSelectedYear = Math.max(maxFiresSelectedYear, value.length)
        }
    
        const myColor = d3.scaleLinear()
        .range(["white", "red"])
        .domain([0, maxFiresSelectedYear]) // Max Fire Count in dictionary
    
        let svg = d3.select("svg")
        
        d3.json("caliCounties.geojson").then (counties => {
            let selectedYearData = yearDict[selectedYear]
    
            console.log(counties)
    
            // Select Our Root coordinate to build map upon
            let county = counties.features.filter(county => county.properties.NAME === "Sacramento")[0]
            console.log(county)   
    
            // Handle placement of points on SVG
            let projection = d3.geoMercator().fitExtent([[heatmapLeft, heatmapTop], [heatmapWidth, heatmapHeight]], county)
            let pathGen = d3.geoPath().projection(projection)

            // Loop Each county
            counties.features.forEach(county => {
                let countyData = selectedYearData[county.properties.NAME]

                var path = svg.append('path')
                    .datum(county)
                    .attr("d", pathGen)
                    .attr('fill', countyData != null ? myColor(countyData.length) : "white")
                    .attr('stroke', 'steelblue')
                    .attr('stroke-width', '2')
                

                path.on("mouseover", (d) => {
                    console.log(d3.event, d)
                    path.attr('stroke', 'black')
                        .attr('stroke-width', '3')

                    let box = svg.append("g")

                    box.append("rect")
                    .attr("x", d3.event.x + 25)
                    .attr("y", d3.event.y - 50 - 25)
                    .attr("width", 250)
                    .attr("height", 50)
                    .style("fill", "lightgray")

                    box.append("text")
                    .attr("class", "popupText")
                    .attr("x", d3.event.x + 50)
                    .attr("y", d3.event.y - 50)
                    .attr("text-align", "center")
                    .attr("font-size", "30px")
                    .text(d.properties.NAME)
                    
                    
                })
                .on("mouseout", d => {
                    path.attr('stroke', 'steelblue')
                        .attr('stroke-width', '2')
                    
                    svg.selectAll(".popupText").remove()
                    svg.selectAll("rect").remove()
                })
                .on("click", d => {
                })
            });
    
        });
    }

}).catch(function(error){
    console.log(error);
});



