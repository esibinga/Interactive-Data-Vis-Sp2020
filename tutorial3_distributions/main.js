/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 6;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selection: "All" // + YOUR FILTER SELECTION
  // score less than 5
  // score 5 or more
  // OR
  // filter by region?
};

/* LOAD DATA */
d3.csv("../data/hfi_cc_2016_only.csv", d3.autoType).then(raw_data => {
  // + SET YOUR DATA PATH
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in 
function init() {
  // + SCALES
  xScale = d3
  .scaleLinear()
  //.domain([0, d3.max(state.data, d => d.pf_ss_women)])
  .domain(d3.extent(state.data, d => d.pf_ss_women)) //x = women's security ORIGINAL
  //.range([50,width])
  .range([margin.left, width-margin.right]);
  //.range([margin.left, width]);

  yScale = d3
  .scaleLinear()
  .domain([0, 10])
    //d3.max(state.data, d => d.pf_score)])
  //.domain(d3.extent(state.data, d => d.pf_score)) //y = overall personal freedom score
  .range([height - margin.bottom, margin.top]);

  // + AXES
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

  // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function() {
    console.log("new selection is", this.value);
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected

    state.selection = this.value
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(["All", "Caucasus & Central Asia", "East Asia", "Eastern Europe", "Latin America & the Caribbean", "Middle East & North Africa", "North America", "Oceania", "South Asia", "Sub-Saharan Africa", "Western Europe"]) // + ADD UNIQUE VALUES
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // + CREATE SVG ELEMENT
  svg = d3
  .select("#d3-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

  // + CALL AXES
    // x axis
  svg
  .append("g")
  .attr("class", "axis x-axis")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(xAxis)
  .append("text")
  .attr("class", "axis-label")
  .attr("x", "50%")
  .attr("dy", "3em")
  .text("Women's Security Score")
  .attr("fill", "black");

    // y axis
  svg
  .append("g")
  .attr("class", "axis y-axis")
  .attr("transform", `translate(${margin.left},0)`)
  .call(yAxis)
  .append("text")
  .attr("class", "axis-label")
  .attr("y", "50%")
  .attr("dx", "-3em")
  .attr("writing-mode", "vertical-rl")
  .text("Overall Personal Freedom Score")
  .attr("fill", "black")

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
 // we call this everytime there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE 
  let filteredData = state.data;
  //if a region selection is made, filter data before adding it to axes
  if (state.selection !== "All") {
   filteredData = state.data.filter(d => d.region === state.selection);
 }

 const dot = svg
   .selectAll("circle") //was (".dot")
   .data(filteredData, d => d.countries)
   //.data(filteredData, d => d.region === state.selection)
   .join(
     enter => 
       // is something supposed to go here?
       enter
       .append("circle")
       .attr("class", "circle") //was .attr("class", "dot")
       .attr("stroke", "lightgrey")
       .attr("opacity", 0)
       .attr("fill", d=> {
          if (d.region === "Caucasus & Central Asia") return "#a6cee3";
          else if (d.region === "East Asia") return "#1f78b4";
          else if (d.region === "Eastern Europe") return "#b2df8a";
          else if (d.region === "Latin America & the Caribbean") return "#33a02c";
          else if (d.region === "Middle East & North Africa") return "#fb9a99";
          else if (d.region === "North America") return "#e31a1c";
          else if (d.region === "Oceania") return "#fdbf6f";
          else if (d.region === "South Asia") return "#ff7f00";
          else if (d.region === "Sub-Saharan Africa") return "#cab2d6";
          else if (d.region === "Western Europe") return "#6a3d9a";
          else return "black";
        })
        .attr("r", radius)
        .attr("cy", d => yScale(d.pf_score))
        .attr("cx", d => xScale(d.pf_ss_women))
        //.attr("cx", d => margin.left)
        .call(enter =>
          enter
            .transition()
            .delay(d => 200 * d.pf_ss_women)
            .duration(1000)
            .attr("opacity", 0.5)
            //.attr("cx", d => xScale(d.pf_ss_women))
        ), 
      update =>
        update
        .call(update => //how do i call this update for a specified group of points?
          update
            .transition()
            .duration(1000)
            //.attr("stroke", "red") //changed this to highlight where the transition is wonky
            .transition()
            .duration(1000)
            .attr("stroke", "lightgrey")
        ),
      exit =>
        exit.call(exit =>
          exit
            .transition()
            .delay(d => 200 * d.pf_score)
            .duration(700)
            .attr("opacity", 0)
            .remove()
        ))
//couldn't get the update to work -- i tried making all my spacing exactly the same, but that didn't have a noticeable effect
// raises the question: why do we need to do update => update.call(update => update.transition...) **that seems like so many in a row!


 //trying to add country label to each point, doesn't seem to have done anything that i can see
    svg.selectAll("text.label")
    .data(filteredData, d => d.countries)
    .join("text")
    .attr("class","label")
    //.text((d) => (d[0] + ", " + d[1]))
    .attr("x", d => xScale(d.pf_ss_women))
    .attr("y", d => yScale(d.pf_score))
    .attr("fill", "gray")
    .attr("font-size", "10px")
   // .attr("opacity", 0.5)
    .text(d => d.countries)   


   // + HANDLE ENTER SELECTION
  //     update => update, // + HANDLE UPDATE SELECTION
  //     exit => exit // + HANDLE EXIT SELECTION
  //   );
}


// This would be much better with a hover effect so that you can see which country
// is which, or at the very least labels on each point. Couldn't figure it out for this time






// extra typing
     //"Caucasus & Central Asia", "East Asia",
     // "Eastern Europe", "Latin America & the Caribbean", 
     //"Middle East & North Africa", "North America", "Oceania",
     // "South Asia", "Sub-Saharan Africa", "Western Europe"]) // + ADD UNIQUE VALUES