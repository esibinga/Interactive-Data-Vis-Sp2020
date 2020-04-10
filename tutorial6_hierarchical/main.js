/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;
let tooltip;

/**
 * APPLICATION STATE
 * */
let state = {
  data: null, //make a container for the data to go in later? ** don't totally understand this
  hover: null,
  mousePosition: null,
};

/**
 * LOAD DATA
 * */
d3.json("../data/flare.json", d3.autotype).then(data => {
  state.data = data;
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  const container = d3.select("#d3-container").style("position", "relative");

  svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const colorScale = d3.scaleOrdinal(d3.schemeSet3); //why is this placed here?

  // + INITIALIZE TOOLTIP IN YOUR CONTAINER ELEMENT
  tooltip = container
    .append("div") //append it to the div tag of the HTML?
    .attr("class", "tooltip") //give it tooltip class
    .attr("width", 100)
    .attr("height", 100)
    .style("position", "absolute");

  // + CREATE YOUR ROOT HIERARCHY NODE
  const root = d3
    .hierarchy(state.data) //set the data source
    .sum(d => d.value) //the 'value' of each level is determined by the 
    .sort((a,b) => b.value - a.value);

  console.log("data:", state.data)

  // + CREATE YOUR LAYOUT GENERATOR
  const pack = d3
    .pack() //it's going to be a circle pack
    .size([width, height]) //it's going to take up the full page width
    .padding([0.2]) //there will be a little space between each block (but these will actually be circles)
    
  // + CALL YOUR LAYOUT FUNCTION ON YOUR ROOT DATA
  pack(root)
  ;

  // + CREATE YOUR GRAPHICAL ELEMENTS
  const leaf = svg
    .selectAll("g")
    .data(root.leaves()) //root is sourced from state.data, and each "leaf" of root is ____? value?
    .join("g")
    .attr("transform", d => `translate(${d.x}, ${d.y})`);

  leaf
    .append("circle") //this will be a circle!!
    .attr("fill", d => {
      const level1Ancestor = d.ancestors().find(d => d.depth === 1);
      return colorScale(level1Ancestor.data.name)
    })
    .attr("r", d => d.r) //this will be radius
    .on("mouseover", d => {
      state.hover = {
        translate: [
          d.x0 + (d.x1 - d.x0) /2,
          d.y0 + (d.y1 - d.y0) /2,
        ],
        name: d.data.name,
        value: d.data.value,
        title: `${d
          .ancestors()
          .reverse()
          .map(d => d.data.name) //what does this do?
          .join("/")}`, //what does this do?
      };
      draw();
    });

  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  // + UPDATE TOOLTIP
  if (state.hover) {
    tooltip
      .html(
        `<div>Name: ${state.hover.name}</div>
        <div>Value: ${state.hover.value}</div>
        <div>Hierarchy Path: ${state.hover.title}</div>
      `
      )
      .transition()
      .duration(500)
      .style(
        "transform",
        `translate(${state.hover.translate[0]}px,${state.hover.translate[1]}px)`
      );
  }
}
