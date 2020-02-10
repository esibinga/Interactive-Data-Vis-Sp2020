//my take

// load in csv
d3.csv("./dataset-2-6.csv").then(data => {
    // once the data loads, console log it
    console.log("data", data);
  
    // select the `table` container in the HTML
    const table = d3.select("#d3-table");
  
    /** HEADER */
    const thead = table.append("thead");
    thead
      .append("tr")
      .append("th")
      .attr("colspan", "7")
      .text("'dataset': 11-minute observation-generated, highly unscientific");
  
    thead
      .append("tr")
      .selectAll("th")
      .data(data.columns)
      .join("td")
      .text(d => d);
  
    /** BODY */
    // rows
    const rows = table
      .append("tbody")
      .selectAll("tr")
      .data(data)
      .join("tr");

  
    // cells
    rows
      .selectAll("td")
      .data(d => Object.values(d))
      .join("td")
      // update the below logic to apply to your dataset

      .attr("class", d => +d > 2 && +d < 5 ? 'td' : null)
      .text(d => d)
      .attr("class", d => +d > 5 && +d < 8 ? 'medium' : null)
      .text(d => d);
});
  

  //.attr("class", d=>{
   // console.log(d);
   // let tag;
   // if (d.frequency > 7) {
     //   tag = "high"
   // }
    //return tag;