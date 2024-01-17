
$(document).ready(function() {
    // Width and Height of the whole visualization
    var w = 2000; 
    var h = 800;  
    //D3 has some internal functionality that can turn GeoJSON data into screen coordinates based on the projection you set. This is not unlike other libraries such as Leaflet, but the result is much more open-ended, not constrained to shapes on a tiled Mercator map.1 So, yes, D3 supports projections.
    var projection = d3.geo.equirectangular()
    // Create GeoPath function that uses built-in D3 functionality to turn
  // lat/lon coordinates into screen coordinates
    var path = d3.geo.path()
      .projection(projection);
    //add the following to create our SVG canvas.
    var svg = d3.select('#safety_index')
      .append('svg')
      .attr('width', w)
      .attr('height', h)
    svg.append('rect')
      .attr('width', w)
      .attr('height', h)
      .attr('fill', 'white');
    // Append empty placeholder g element to the SVG
    // g will contain geometry elements
    var g = svg.append("g");
    
    //add a call to d3.json to load the TopoJSON file
    //so it loads into our visualization
    d3.json('world.topojson', function(error, data) {
      if (error) console.error(error);


      g.append('path')
        .datum(topojson.feature(data, data.objects.countries))
        .attr('d', path)
        
      //create the zoom effect
      var zoom = d3.behavior.zoom()
        .on("zoom", function() {
          g.attr("transform", "translate(" +
            d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
          g.selectAll("path")
            .attr("d", path.projection(projection));
        });
      svg.call(zoom);
      
      // Load the data from the json file
      d3.csv('Crime_Dataset.csv', function(error, crime_data) {
        //console.log(crime_data)
        if (error) 
          console.error(error);
        
        // Get the minimum and maximum values of the 'Rank' property in the 'crime_data' array
        var nMinAndMax = d3.extent(crime_data, function(d) {
            return +d.Rank;
        });
  
        // Define the minimum and maximum values of the output range
        var rMin = 5;
        var rMax = 1;
  
        // Create a function to map input values to output values
        function nToRadius(n) {
            var proportion = (n - nMinAndMax[0]) / (nMinAndMax[1] - nMinAndMax[0]); // calculate proportion of input value in domain
            var rangeSpan = rMax - rMin; // calculate the span of the output range
            var mappedValue = proportion * rangeSpan + rMin; // map proportion to output range
            return mappedValue;
        }
  
        
        
        
        g.selectAll('circle')
          .data(crime_data)
          .enter()
          .append('circle') //show the circles
          .attr('cx', function(d) {
            return projection([d.lng,d.lat])[0]
          })
          .attr('cy', function(d) {
            return projection([d.lng,d.lat])[1]
          })
          .attr('r',function(d){
            return nToRadius(d.Rank);
        })
          .attr("fill","red")
          .attr("stroke",function(d){
                if (+d.Rank < 50){
                    return "black";
                }else return "none";
            })
           .attr("stroke-width", 0.1)
           .attr("fill-opacity",function(d){
                if (+d.Rank < 50){
                    return 0.7
                }else if (+d.Rank > 50 && +d.Rank < 100 ) return 0.4
                else return 0.2
            })
           .on("mouseover", function (d) {
              
            d3.select(this).style('fill','black');
            d3.select('#city').text(d.City);
            d3.select('#safety').text(d.Crime_Index);
            d3.select('#tooltip')
                .style('left',(d3.event.pageX + 20) + 'px')
                .style('top', (d3.event.pageY - 80) + 'px')
                .style('display','block')
                .style('opacity',0.8)

            })
            .on('mouseout',function(d){
                d3.select(this).style('fill',d.color);
                d3.select('#tip')
                    .style('display','none');
         });

        
        //Next, we need to write two pieces of code, one that listens for when the value of the tooltip changes, and one that updates the SVG elements.
        //We are going to use some D3 code to listen for an input change on the tooltip elements
        
      });

    });
  });