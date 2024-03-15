// changed to fit the screen of a standard 1920x1080 monitor
const width = 1920 * .9;
const height = 1080 * .7; 

let heatmapMargin = {top: 10, right: 10, bottom: 10, left: 10}
let heatmapTop = 350
let heatmapLeft = 200
let heatmapWidth = 50 + heatmapLeft
let heatmapHeight = 100 + heatmapTop

const lineChartMargin = { top: 50, right: 50, bottom: 50, left: 80 };
const lineChartWidth = width * 0.5 - lineChartMargin.left - lineChartMargin.right;
const lineChartHeight = height - lineChartMargin.top - lineChartMargin.bottom;

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
    let causeCountbyYear = {};
    let monthlyFireCounts = {};

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

    // Parse Data for Cause of Fire by Year and Months
    rawData.forEach((element) => {
        const year = element.FIRE_YEAR;
        const cause = element.NWCG_CAUSE_CLASSIFICATION;
        const date = new Date(element.DISCOVERY_DATE);
        const month = date.getMonth() + 1; // Add 1 to month (0-indexed)
        const yearMonthKey = `${year}-${month}`;
    
        // Update causeCountbyYear
        if (!causeCountbyYear[year]) {
            causeCountbyYear[year] = { "Natural": 0, "Human": 0 };
        }
        if (cause === "Natural") {
            causeCountbyYear[year]["Natural"] ++;
        } else if (cause === "Human") {
            causeCountbyYear[year]["Human"]++;
        }
    
        // Update monthlyFireCounts
        if (!monthlyFireCounts[yearMonthKey]) {
            monthlyFireCounts[yearMonthKey] = { total: 0, "Natural": 0, "Human": 0 };
        }
        monthlyFireCounts[yearMonthKey].total++;
        if (cause === "Natural") {
            monthlyFireCounts[yearMonthKey]["Natural"]++;
        } else if (cause === "Human") {
            monthlyFireCounts[yearMonthKey]["Human"]++;
        }

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
       d3.select()
       d3.selectAll("path").remove()
       d3.selectAll("circle").remove()

       d3.select("svg").call(zoom.transform, d3.zoomIdentity.scale(1));
       drawMap()
       //drawFireDots()
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


    function handleZoom() {
        let selected = d3.selectAll("path, circle")
        let circle = d3.selectAll("circle")
        console.log(d3.event.transform.k, circle)
        if (d3.event.transform.k > 1.5) {
            if (circle.empty())
                drawFireDots()
        }
            
        else {
            d3.selectAll("circle").remove()
        }
        selected.attr("transform", d3.event.transform)
    }


    let zoom = d3.zoom()
    .filter(() => {
        const target = d3.event.target;
        return !target.closest("#line-chart-container, #line-chart-svg"); // Ignore zoom events on the line chart container and SVG
    })
    .on("zoom", handleZoom);
    // Zooming
    let svg = d3.select("svg")
        .call(zoom)

    drawTitle()
    drawLegend()
    drawMap()
    drawLineChart()

    //drawFireDots()


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
        .text("California Fire Map 1992-2020")

            
    }

    function drawLegend() {
        let legend = svg.append("g")

        let rootX = 600
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
        .style("fill", "Blue")
        .attr("stroke", "black")

        legend.append("rect")
        .attr("x", rootX+170)
        .attr("y", rootY+10 + dotOffsetY)
        .attr("width", 25)
        .attr("height", 25)
        .style("fill", "Orange")
        .attr("stroke", "black")


    }

    function drawEmptyCaliMap() {
        d3.json("caliCounties.geojson").then (counties => {
            let selectedYearData = yearDict[selectedYear]
    
            // Select Our Root coordinate to build map upon
            let county = counties.features.filter(county => county.properties.NAME === "Sacramento")[0]

            // Handle placement of points on SVG
            let projection = d3.geoMercator().fitExtent([[heatmapLeft, heatmapTop], [heatmapWidth, heatmapHeight]], county)
            let pathGen = d3.geoPath().projection(projection)

            // Loop Each county
            counties.features.forEach(county => {
                let countyData = selectedYearData[county.properties.NAME]

                var path = svg.append('path')
                    .datum(county)
                    .attr("d", pathGen)
                    .attr('fill', 'none')
                    .attr('stroke', 'steelblue')
                    .attr('stroke-width', '2')
            });
    
        });
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
            //console.log(county)   
    
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
                        if (d.NWCG_CAUSE_CLASSIFICATION === "Human") return "Orange";
                        else if (d.NWCG_CAUSE_CLASSIFICATION === "Natural") return "Blue";
                        else return "Gray";
                    });
        });
    }

    function drawLineChart() {
        const lineChartContainer = d3.select("body")
        .append("div")
        .attr("id", "line-chart-container")
        .style("position", "absolute") 
        .style("top", "0px")
        .style("left", `${width * 0.5}px`)

        const svgLineChart= lineChartContainer
        .append("svg")
        .attr("id", "line-chart-svg") // unique id
        .attr("width", lineChartWidth * 2 + lineChartMargin.left + lineChartMargin.right)
        .attr("height", lineChartHeight + lineChartMargin.top + lineChartMargin.bottom)
        .append("g")
        .attr("transform", `translate(${lineChartMargin.left}, ${lineChartMargin.top})`);


    // x and y scales
    const xScale = d3.scaleBand()
        .range([0, lineChartWidth])
        .domain(Object.keys(causeCountbyYear).map(year => parseInt(year)))
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .range([lineChartHeight, 0])
        .domain([0, d3.max(Object.values(causeCountbyYear), d => d.Human + d.Natural)]);

    // x and y axis generators
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    // draw x and y axis
    svgLineChart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${lineChartHeight})`)
        .call(xAxis);

    svgLineChart.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    // drawing lines for chart
    const lineGeneratorHuman = d3.line()
        .x((d, i) => xScale(parseInt(Object.keys(causeCountbyYear)[i])) + xScale.bandwidth() / 2)
        .y(d => yScale(d.Human));

    const lineGeneratorNatural = d3.line()
        .x((d, i) => xScale(parseInt(Object.keys(causeCountbyYear)[i])) + xScale.bandwidth() / 2)
        .y(d => yScale(d.Natural));

     // horizontal grid lines
    svgLineChart.selectAll(".grid-line")
        .data(yScale.ticks())
        .enter().append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", lineChartWidth)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .style("stroke", "lightgray")
        .style("stroke-opacity", 0.7);
    

    // line for human-caused fires
    svgLineChart.append("path")
        .datum(Object.values(causeCountbyYear))
        .attr("fill", "none")
        .attr("stroke", "Orange") // color for human-caused fires
        .attr("stroke-width", 2)
        .attr("d", lineGeneratorHuman);

    //  line for natural causes
    svgLineChart.append("path")
        .datum(Object.values(causeCountbyYear))
        .attr("fill", "none")
        .attr("stroke", "blue") //color for natural causes
        .attr("stroke-width", 2)
        .attr("d", lineGeneratorNatural);
    // labels
    svgLineChart.append("text") // x axis label
        .attr("transform", `translate(${lineChartWidth / 2}, ${lineChartHeight + 40})`)
        .style("text-anchor", "middle")
        .text("Year");

    svgLineChart.append("text") // y axis label
        .attr("transform", "rotate(-90)")
        .attr("x", -lineChartHeight / 2)
        .attr("y", -40)
        .style("text-anchor", "middle")
        .text("Number of Fires");
    
    svgLineChart.append("text") // chart title
        .attr("x", lineChartWidth / 2)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .style("font-size", "24px")
        .text("Trends of California Fires by Cause")


    const legendRectSize = 20; // Size of the colored rectangles in the legend
    const legendSpacing = 5; // Spacing between the colored rectangles and the labels in the legend
        
         
    // Define legend data
    const legendData = [
        { label: "Human", color: "Orange" },
        { label: "Natural", color: "Blue" }
    ];

    // Append legend group
    const legend = svgLineChart.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${lineChartWidth + 20}, ${lineChartHeight / 2})`);

    // Append legend items
    const legendItems = legend.selectAll(".legend-item")
        .data(legendData)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 30})`);

    // Append legend lines
    legendItems.append("line")
        .attr("x1", 0)
        .attr("x2", 30)
        .attr("y1", 10)
        .attr("y2", 10)
        .attr("stroke", d => d.color)
        .attr("stroke-width", 2);

    // Append legend labels
    legendItems.append("text")
        .attr("x", d => legendRectSize + legendSpacing + 5) // Adjust the x-position here
        .attr("y", legendRectSize / 2)
        .text(d => d.label)
        .attr("fill", "black")
        .style("font-size", "16px")
        .attr("alignment-baseline", "middle");  

    }

}).catch(function(error){
    console.log(error);
  });

