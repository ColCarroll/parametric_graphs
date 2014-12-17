var duration = 4000;

function parametricPlot(f, range, id){
    plot(f, range, id);
    setInterval(function(){plot(f, range, id);}, 1.5 * duration);
}

function plot(f, range, id){
    var data = range.map(f);
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .domain(d3.extent(data, function(d){return d.x;}))
        .range([0, width]);

    var y = d3.scale.linear()
        .domain(d3.extent(data, function(d){return d.y;}))
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right");

    var line = d3.svg.line()
        .x(function(d) { return x(d.x) })
        .y(function(d) { return y(d.y) });

    d3.select(id).selectAll("*").remove();

    var svg = d3.select(id)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height/2 + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 4)
        .attr("dx", -4);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width/2 + ",0)")
        .call(yAxis)
        .selectAll("text")
        .attr("x", 4)
        .attr("dy", -4);

    svg.append('path')
        .attr("class", "line")
        .transition()
        .ease('linear')
        .duration(duration)
        .attrTween('d', getInterpolation(data, line));
}

function getInterpolation(dataSet, lineFunc) {
    return function(d, i, a) {
        var interpolate = d3.scale.linear()
            .domain([0, 1])
            .range([0, dataSet.length + 1]);

        return function (time) {
            var timeFloor = Math.floor(interpolate(time));
            return lineFunc(dataSet.slice(0, d3.max([timeFloor, 1])));
        };
    }
}
