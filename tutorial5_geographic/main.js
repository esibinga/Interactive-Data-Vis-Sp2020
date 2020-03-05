/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.55,
  margin = { top: 0, bottom: 50, left: 60, right: 40 };

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;

/**
 * APPLICATION STATE
 * */
let state = {
  geojson: null,
  extremes: null,
  hover: {
    Latitude: null,
    Longitude: null,
    State: null,
    Change: null,
  }
  // + SET UP STATE
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("../data/us-state.json"),
  d3.csv("../data/usHeatExtremes.csv", d3.autoType),
]).then(([geojson, extremes]) => {
  state.geojson = geojson;
  state.extremes = extremes;
  console.log("state: ", state);
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  // define projection and path -- only needs to be done once and won't change
  // in draw, so can be done just in init()
  const projection = d3.geoAlbersUsa().fitSize([width, height], state.geojson);
  const path = d3.geoPath().projection(projection);



  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width*1.1)  //increase size of svg container to buffer so that no dots are cut off (more code needed below)
    .attr("height", height*1.1);
  
  // + SET UP PROJECTION
  // + SET UP GEOPATH
  // + DRAW BASE MAP PATH
  // + ADD EVENT LISTENERS (if you want)
  svg
    .selectAll(".state") //all of the features of the geojson (all of the US states)
    .data(state.geojson.features)
    .join("path")
    .attr("d", path) //this "d" is different from d => --- it is just howa  path is always indicated
    .attr("class", "state")
    .attr("fill", "transparent")
    .attr('transform', 'translate(-100,20)') //move the map down 20 pixels so northernmost circles won't be cut off (this would be better done with percents so that the values are relative, but that gave me some trouble)
    .on("mouseover", d => {
      state.hover["State"] = d.properties.NAME; //"NAME" is the state name, taken from the features list in the geojson (can see it console logged data)
      draw()
     }) //re call draw when hover state changes
    // .on("mouseout", d => { //I wanted to make it so that the state mouseover function turns off when you're not on a state (otherwise you get "California" when you're on the ocean), but this was tricky
    //   state.hover["State"] = "Ocean"; // The state name only shows up when you are NOT mousing over a dot, which means this "Ocean" will show up even when you're on a dot that's on a state
    //   I tried flipping the order and putting dots first, then the map, but then the dot-mouseover doesn't work. Seems like one answer could be to connecting each dot to the state it is in by saying 
    //   "if the lat-long of this dot fall within the lat-long of State X path, label this dot as State X"
    //     draw();
    //   })
    ;

    var heatColors = d3.scaleLinear()
    .domain(d3.extent(state.extremes, d => d['Change in 95 percent Days'],2))
    .range(["blue", "yellow"]);
  
   svg
    .selectAll("circle")
    .data(state.extremes)
    .join("circle")
    .attr("r", 5)
    .attr("opacity", 0.8)
    .attr("fill", d => {
      return heatColors(d['Change in 95 percent Days'])
    })
    .attr("transform", d=>  {
      console.log(projection(d.Long, d.Lat))
      const [x,y] = projection([d.Long, d.Lat]);
      return `translate(${x-100}, ${y+20})`; //when these circles are mapped, translate the y-value down 20 pixels so that it lines up correctly with the underlying map
    })
    .on("mouseover", function(d) {
      //console.log("this", this);
      d3.select(this)
        .attr("opacity", 1)
        //.attr("fill", "blue") //could add a "glow effect" here too
        .attr("r", 8);
      state.hover["Change"] = d['Change in 95 percent Days'];
      draw();
    })
    .on("mouseout", function(d) {
      d3.select(this)
      .attr("r", 5)
      .attr("opacity", 0.8);
      draw();
    });


//test lat long
    svg.on("mousemove", () => {
      // we can use d3.mouse() to tell us the exact x and y positions of our cursor
      const [mx, my] = d3.mouse(svg.node());
      // projection can be inverted to return [lat, long] from [x, y] in pixels
      const proj = projection.invert([mx, my]);
      state.hover["Longitude"] = proj[0]; 
      state.hover["Latitude"] = proj[1]; 
      draw();
    });


  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  // return an array of [key, value] pairs
  hoverData = Object.entries(state.hover);

  d3.select("#hover-content")
     .selectAll("div.row")
     .data(hoverData)
     .join("div")
     .attr("class", "row")
     .html(
       d =>
         // each d is [key, value] pair
         d[1] // check if value exist
           ? `${d[0]}: ${d[1]}` // if they do, fill them in
           : "No data available for this point" // otherwise, print this message (or null to show nothing)
     ); 
        // This ^ would look much better if I could print "Change in 95% Days" for the final variable, but can't figure out how to 
        // print a message for one of them instead of just the variable name for each key in "d" 
}
   
