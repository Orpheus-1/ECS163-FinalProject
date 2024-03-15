// changed to fit the screen of a standard 1920x1080 monitor
const width = 1920 * .9;
const height = 1080 * .7; 

let heatmapMargin = {top: 10, right: 10, bottom: 10, left: 10}
let heatmapTop = 350
let heatmapLeft = 200
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
d3.csv("california.csv")
  .then((rawData) => {
    let yearDict = {};

    // Parse Data into Dict of years and Separated by County Name
    rawData.forEach((element) => {
      if (element.FIRE_YEAR in yearDict) {
        let countyName = codeToCountyMap[element.FIPS_CODE];

        if (countyName in yearDict[element.FIRE_YEAR]) {
          yearDict[element.FIRE_YEAR][countyName].push(element);
        } else {
          yearDict[element.FIRE_YEAR][countyName] = [];
        }
      } else {
        yearDict[element.FIRE_YEAR] = {};
      }
      return;
    });

    //Base Selected Year
    let selectedYear = 1992

    const possibleYears = Object.keys(yearDict)
    // Append Select
    var select = d3.select("select")
        .style("font-size", "30px")


    select.on("change", d => {
        selectedYear = d3.select("select").property("value");
       // svg
       d3.selectAll("path").remove()
       d3.selectAll("circle").remove()

       drawMap()
       drawFireDots()
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

    let svg = d3.select("svg")
    // Zooming
    let zoom = d3.zoom()
        .on('zoom', handleZoom)

    drawTitle()
    drawLegend()
    drawMap()

    drawFireDots()

    function zoomToCounty() {

    }

    function drawTitle() {
        let title = svg.append("g")
        
        let rootX = 125
        let rootY = 85

        title.append("text")
        .attr("class", "titleText")
        .attr("x", rootX)
        .attr("y", rootY)
        .attr("text-align", "center")
        .attr("font-size", "30px")
        .text("California Fire map 1992-2020")

            
    }
    function drawLegend() {
        let legend = svg.append("g")

        let rootX = 700
        let rootY = 200
        let dotOffsetY = 50
        legend.append("text")
        .attr("x", rootX+5)
        .attr("y", rootY)
        .attr("text-align", "center")
        .attr("font-size", "25px")
        .text("Heatmap Key")

        legend.append("text")
        .attr("x", rootX+40)
        .attr("y", rootY+30)
        .attr("text-align", "center")
        .attr("font-size", "20px")
        .text("More")

        legend.append("text")
        .attr("x", rootX+40)
        .attr("y", rootY+210)
        .attr("text-align", "center")
        .attr("font-size", "20px")
        .text("Less")

        legend.append("rect")
        .attr("x", rootX+50)
        .attr("y", rootY+50)
        .attr("width", 25)
        .attr("height", 25)
        .style("fill", "red")
        .attr("stroke", "black")

        legend.append("rect")
        .attr("x", rootX+50)
        .attr("y", rootY+75)
        .attr("width", 25)
        .attr("height", 25)
        .style("fill", "rgba(255, 0, 0, 0.6)")
        .attr("stroke", "black")

        legend.append("rect")
        .attr("x", rootX+50)
        .attr("y", rootY+100)
        .attr("width", 25)
        .attr("height", 25)
        .style("fill", "rgba(255, 0, 0, 0.4)")
        .attr("stroke", "black")

        legend.append("rect")
        .attr("x", rootX+50)
        .attr("y", rootY+125)
        .attr("width", 25)
        .attr("height", 25)
        .style("fill", "rgba(255, 0, 0, 0.2)")
        .attr("stroke", "black")

        legend.append("rect")
        .attr("x", rootX+50)
        .attr("y", rootY+150)
        .attr("width", 25)
        .attr("height", 25)
        .style("fill", "white")
        .attr("stroke", "black")
        

        // Dot
        legend.append("text")
        .attr("x", rootX+150)
        .attr("y", rootY + dotOffsetY)
        .attr("text-align", "center")
        .attr("font-size", "25px")
        .text("Fire Causes")

        legend.append("text")
        .attr("x", rootX+210)
        .attr("y", rootY+30 + dotOffsetY)
        .attr("text-align", "center")
        .attr("font-size", "20px")
        .text("Human")

        legend.append("text")
        .attr("x", rootX+210)
        .attr("y", rootY+60 + dotOffsetY)
        .attr("text-align", "center")
        .attr("font-size", "20px")
        .text("Natural")

        legend.append("rect")
        .attr("x", rootX+170)
        .attr("y", rootY+40 + dotOffsetY)
        .attr("width", 25)
        .attr("height", 25)
        .style("fill", "red")
        .attr("stroke", "black")

        legend.append("rect")
        .attr("x", rootX+170)
        .attr("y", rootY+10 + dotOffsetY)
        .attr("width", 25)
        .attr("height", 25)
        .style("fill", "green")
        .attr("stroke", "black")


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
        

        d3.json("caliCounties.geojson").then (counties => {
            let selectedYearData = yearDict[selectedYear]
    
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
                    .attr("class", "popupRect")
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
                    svg.selectAll(".popupRect").remove()
                })
                .on("click", d => {
                })
            });
    
        });
    }


    function drawFireDots() {
        let selectedYearData = yearDict[selectedYear]
        
        const yearDictValues = Object.entries(selectedYearData) 
        let allDataForYear = []

        // Combine all data for year
        for (const [key, value] of yearDictValues) {
            allDataForYear = allDataForYear.concat(value)
        }
        
        const fireData = allDataForYear.filter(d => d.LATITUDE && d.LONGITUDE && d.NWCG_CAUSE_CLASSIFICATION);

        d3.json("caliCounties.geojson").then (counties => {
            let county = counties.features.filter(county => county.properties.NAME === "Sacramento")[0]

            // Handle placement of points on SVG
            let projection = d3.geoMercator().fitExtent([[heatmapLeft, heatmapTop], [heatmapWidth, heatmapHeight]], county)

            // Draw fire points on the heatmap
            svg.selectAll("circle")
                .data(fireData)
                .enter()
                    .append("circle")
                    .attr("cx", d => projection([parseFloat(d.LONGITUDE), parseFloat(d.LATITUDE)])[0])
                    .attr("cy", d => projection([parseFloat(d.LONGITUDE), parseFloat(d.LATITUDE)])[1])
                    .attr("r", 0.5)
                    .attr("fill", d => {
                        if (d.NWCG_CAUSE_CLASSIFICATION === "Human") return "red";
                        else if (d.NWCG_CAUSE_CLASSIFICATION === "Natural") return "green";
                        else return "gray";
                    });
        });
    }

}).catch(function(error){
    console.log(error);
  });

