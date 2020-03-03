/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5
  default_selection = "All";


// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let yAxis;

/* APPLICATION STATE */
let state = {
  data: [],
  selection: "All", // + YOUR FILTER SELECTION
};

/* LOAD DATA */
// + SET YOUR DATA PATH
 d3.csv("../data/NYC_payroll_data.csv", d => ({
   year: new Date(d.year, 0, 1),
   borough: d.borough,
   jobTitle: d.title,
   agName: d.agency_name,
   salary: d.base_salary,
 }))  //d3.autoType({date: "%m/%d/%Y"}))
.then(raw_data => {
   console.log("raw_data", raw_data);
   //console.log("new date", );
   state.data = raw_data;
   init();
 });

//  data.forEach(function(d) {
//   d.obs_date = parseDate(d.obs_date);
//   d.recovered = +d.recovered;
//   });
// // d3.timeFormat(obs_date);
//   var parseDate = d3.time.format("%m/%d/%y").parse;
//   )
// d => ({
//   obs_date1: new Date(),
// })).then(raw_data => {
//   console.log("raw_data", raw_data);
//   //console.log("new date", );
//   state.data = raw_data;
//   init();
// });

//(d3.time.format('%m/%d/%Y'))

// d=> ({
//   obsDate: new Date(d.ObservationDate,),
//   country: Country/Region,
//   recovered: Recovered,
// })

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
  xScale = d3
   .scaleTime()
   .domain(d3.extent(state.data, d => d.year))
   //.domain(d3.extent(state.data, d => new Date(d.year, 0, 1)))
   .range([margin.left, width - margin.right]);

  yScale = d3
   .scaleLinear()
   .domain([0, d3.max(state.data, d => d.salary)])
   .range([height - margin.bottom, margin.top]);

  // + AXES
  const xAxis = d3.axisBottom(xScale);
  yAxis = d3.axisLeft(yScale);

  // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    state.selection = this.value; // + UPDATE STATE WITH YOUR SELECTED VALUE
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(["All", "Bronx", "Brooklyn", "Manhattan", "Queens", "Richmond", ""]) // + ADD DATA VALUES FOR DROPDOWN
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // + SET SELECT ELEMENT'S DEFAULT VALUE (optional)
  selectElement.property("value", default_selection);

  // + CREATE SVG ELEMENT
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // + CALL AXES
  svg //xAxis
    .append("g") //what does this do again? ****
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%") //what does this do? ****
    .attr("dy", "3em")
    .text("Year");

svg //yAxis
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3.5em")
    .attr("writing-mode", "vertical-rl")
    .text("Base Salary for NYC Employees");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  let filteredData;
  if (state.selection !== null) {
    filteredData = state.data.filter(d => d.borough === state.selection)
  }
  //
  // + UPDATE SCALE(S), if needed
  yScale.domain([0, d3.max(filteredData, d => d.salary)])
  // + UPDATE AXIS/AXES, if needed
 
  //COMMENTED OUT FOR NOW ******
  d3.select("g.y-axis")
    .transition()
    .duration(1000)
    .call(yAxis.scale(yScale));

  // + DRAW CIRCLES, if you decide to
  // const circle = svg
  //   .selectAll("circle")
  //   .data(filteredData, d => d.borough)
  //   .join(
  //     enter => enter, // + HANDLE ENTER SELECTION
  //     update => update, // + HANDLE UPDATE SELECTION
  //     exit => exit // + HANDLE EXIT SELECTION
  //   );
  //
  // + DRAW LINE AND AREA
const lineFunc = d3 //change this to AREA ***
  .line()
  .x(d => xScale(d.year))
  .y(d => yScale(d.salary))
  //.attr("fill", "red")
console.log("linefunc", lineFunc(filteredData))

const dot = svg
  .selectAll(".path")
  .data(filteredData, d => d.borough)
  .join(
    enter =>
    enter
      .append("circle")
      .attr("class", "path")
      .attr("r", radius)
      .attr("cy", height - margin.bottom)
      .attr("cx", d => xScale(d.year)), //ALL OF THESE ARE JUST SHOWING UP ON THE X-AXIS
    update => update,
    exit =>
      exit.call(exit =>
        exit
          .transition()
          .delay(d => d.year)
          .duration(500)
          .attr("cy", height - margin.bottom)
          .attr("cx", d => xScale(d.year))
          .remove()
      )
  )
  .call(
    selection =>
     selection
     .transition()
     .duration(1000)
     .attr("cy", d => yScale(d.salary))
     .attr("cx", d => yScale(d.year))
  );
  const line = svg.selectAll("path.trend")
  .data([filteredData])
  .join(
    enter =>
     enter
      .append("path")
      .attr("class", "trend")
      .attr("opacity", 1)
      .attr("fill", "black"),
    update => update,
    exit => exit.remove()
  )
  .call(selection =>
    selection
      .transition()
      .duration(1000)
      .attr("opacity", 1)
      .attr("d", d => lineFunc(d))
  );
}


// I used some of Joanne's script for subsetting this dataset in python
