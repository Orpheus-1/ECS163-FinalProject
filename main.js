// Imports
// import { codeToCountyMap } from "./codeToCountyMap";

// changed to fit the screen of a standard 1920x1080 monitor
const width = 1920 * 0.9;
const height = 1080 * 0.7;

let heatmapMargin = { top: 10, right: 10, bottom: 10, left: 10 };
let heatmapTop = 400;
let heatmapLeft = 400;
let heatmapWidth = 50 + heatmapLeft;
let heatmapHeight = 50 + heatmapTop;

export const codeToCountyMap = {
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
  "06095": "Solano",
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
};

// read the raw data from csv to plot
d3.csv("california.csv")
  .then((rawData) => {
    let yearDict = {};
    console.log(rawData);
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

    console.log(yearDict);

    const myColor = d3.scaleLinear().range(["white", "red"]).domain([0, 100]); // Max Fire Count in dictionary

    d3.json("caliCounties.geojson").then((counties) => {
      let selectedYearData = yearDict["2000"]; // ToDo Adjust when using html input box selection.

      console.log(counties);

      // Select Our Root coordinate to build map upon
      let county = counties.features.filter(
        (county) => county.properties.NAME === "Sacramento"
      )[0];
      console.log(county);

      // Handle placement of points on SVG
      let projection = d3.geoMercator().fitExtent(
        [
          [heatmapLeft, heatmapTop],
          [heatmapWidth, heatmapHeight],
        ],
        county
      );
      let pathGen = d3.geoPath().projection(projection);

      let svg = d3.select("svg");

      counties.features.forEach((county) => {
        svg.selectAll("path")
            .data(counties.features)
            .enter()
            .append("path")
            .attr("d", pathGen)
            .attr("fill", "transparent")
            .attr("stroke", "steelblue")
            .attr("stroke-width", "2")
            .on("click", function(d) {
            console.log("Clicked on county:", d.properties.NAME);
        });

        // Extract fire data
        const fireData = rawData.filter(d => d.LATITUDE && d.LONGITUDE && d.NWCG_CAUSE_CLASSIFICATION);
        console.log(fireData)


        // Draw fire points on the heatmap
        svg.selectAll("circle")
            .data(fireData)
            .enter()
            .append("circle")
            .attr("cx", d => projection([parseFloat(d.LONGITUDE), parseFloat(d.LATITUDE)])[0])
            .attr("cy", d => projection([parseFloat(d.LONGITUDE), parseFloat(d.LATITUDE)])[1])
            .attr("r", 1.5)
            .attr("fill", d => {
                if (d.NWCG_CAUSE_CLASSIFICATION === "Human") return "red";
                else if (d.NWCG_CAUSE_CLASSIFICATION === "Natural") return "blue";
                else return "green";
            });
      
      
      });
      
    });
  })
  .catch(function (error) {
    console.log(error);
  });

