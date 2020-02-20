//MY CODE

d3.csv("../data/squirrelActivities.csv", d3.autoType).then(data => {
    console.log(data);
    console.log("where r u ");

    //constants (**starting with just values from class, will modify as needed once bars show up)
    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.9,
    paddingInner = 0.2,
    margin = { top: 20, bottom: 40, left: 70, right: 50 };
    
    // scale X and Y
    const xScale = d3
    .scaleLinear() //change this to .scaleLinear DONE
    .domain([0, d3.max(data, d => d.count)])
    .range([margin.left, width - margin.right]);
    //.domain(data.map(d => d.count)) //change this to d.count DONE
    // ^ above line was wrong because data.map is for discrete -> discrete counts?

    const yScale = d3
    .scaleBand() //change this to .scaleBand() DONE
    .domain(data.map(d => d.activity))
    .range([height - margin.bottom, margin.top])
    .paddingInner(paddingInner); //had to be moved here because padding is now between ordinal categories on y axis (i.e. no place for padding on x axis)
    //.domain([0,d3.max(data,d=>d.activity)]) //change this to d.activity DONE
    // ^ above line was wrong bc [0, d3.max()] is a way to map continuous data? and activity is discrete?

    const yAxis = d3
    .axisLeft(yScale)
    .ticks(data.length);

    //draw rectangles
    const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

    const rect = svg
    svg.selectAll("rect")
    .data(data)
    .join("rect")

  
    .attr("x", d=> margin.left)
    .attr("width", d => xScale(d.count))
    .attr("y", d=>yScale(d.activity)) //change this to d=>yScale(d.activity) DONE
    .attr("height", yScale.bandwidth()) //how does it know that you mean "bandheight" and not literal width? is that because y is scaled discretely?

    .attr("fill", "steelblue");

    //add axis labels and text
    const text = svg
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("class", "label")
    .attr("x", d => xScale(d.count))
    .attr("y", d => yScale(d.activity) + (yScale.bandwidth() / 2))
    .text(d => d.count)
    .attr("dy", ".5em");

    svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left - 1}, -.5)`)
    .call(yAxis);

});
