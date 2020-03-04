/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

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
    latitude: null,
    longitude: null,
    state: null,
    ninetyfiveChange: null,
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
    .attr("width", width)
    .attr("height", height);

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
    .on("mouseover", d => {
      state.hover["state"] = d.properties.NAME; //"NAME" is the state name, taken from the features list in the geojson (can see it console logged data)
      draw(); //re call draw when hover state changes
    });

    var heatColors = d3.scaleLinear()
    .domain(d3.extent(state.extremes, d => d['Change in 95 percent Days'],2))
     //.domain(d3.min(state.extremes, d => d['Change in 95 percent Days']), d3.max(state.extremes, d => d['Change in 95 percent Days']))
    .range(["yellow", "red"]);
     //.range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598", 
    //"#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]);
    //console.log("95 extent:", d3.extent(state.extremes, d => d['Change in 95 percent Days']));
    //console.log("heatColors", heatColors)
    
    //color = f(n)
    //color = d3.scaleSequential(d3.extent(state.extremes, d => d['Change in 95 percent Days'].flat()), d3.interpolateReds().nice());

   svg
    .selectAll("circle")
    .data(state.extremes)
    .join("circle")
    .attr("r", 5)
    .attr("opacity", 0.8)
    //.attr("fill", heatColors)
    .attr("fill", d => {
      return heatColors(d['Change in 95 percent Days'])
    })
    .attr("transform", d=>  {
      console.log(projection(d.Long, d.Lat))
      const [x,y] = projection([d.Long, d.Lat]);
      //const y = projection(d.Long, d.Lat);
      return `translate(${x}, ${y})`;
    })
    .on("mouseover", d => {
      d3.select(this).attr({
        opacity: 1,
        fill: "blue",
        r: 7
      })
      state.hover["ninetyfiveChange"] = d['Change in 95 percent Days'];
      draw();
      //console.log("this:", this)
    })
    ;
  
//test lat long
    svg.on("mousemove", () => {
      // we can use d3.mouse() to tell us the exact x and y positions of our cursor
      const [mx, my] = d3.mouse(svg.node());
      // projection can be inverted to return [lat, long] from [x, y] in pixels
      const proj = projection.invert([mx, my]);
      state.hover["longitude"] = proj[0];
      state.hover["latitude"] = proj[1];
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

  // d3.select("#hover-content")
  //   .selectAll("div.row")
  //   .data(hoverData)
  //   .join("div")
  //   .attr("class", "row")
  //   .html(
  //     d =>
  //       // each d is [key, value] pair
  //       d[1] // check if value exist
  //         ? `${d[0]}: ${d[1]}` // if they do, fill them in
  //         : null // otherwise, show nothing
  //   );
}
   
  
//.on("mouseover", handleMouseOver)
//.on("mouseout", handleMouseOut);

// function handleMouseOver(d, i) {
//       d3.select(this).attr({
//         opacity: 1,
//         fill: "blue",
//         r: 7
//       })
//     }

// function handleMouseOut(d,i) {
//       d3.select(this).attr({
//         opacity: 0.8,
//         r: 5
//       })
//  }