function parametricPlot(f, range, id, options){
	options = options || {};
	var duration = options.duration || 4000;
	var width = options.width || 800;
	var height = options.height || 500;

	var plotter = function(){plot(f, range, id, duration, width, height)};
	plotter()
	setInterval(plotter, 1.5 * duration);
}

function plot(f, range, id, duration, width, height){
    var data = range.map(f);
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;

    function getRange(axis){
        var extent = d3.extent(data, function(d){ return d[axis]});
        var range = extent[1] - extent[0];
        var min = d3.min([extent[0], -0.1 * range]);
        var max = d3.max([extent[1], 0.1 * range]);
        return [min, max]
    }

    var x = d3.scale.linear()
        .domain(getRange("x"))
        .range([0, width]);

    var y = d3.scale.linear()
        .domain(getRange("y"))
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
        .attr("transform", "translate(0," + y(0) + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 4)
        .attr("dx", -4);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + x(0) + ",0)")
        .call(yAxis)
        .selectAll("text")
        .attr("x", 4)
        .attr("dy", -4);

    svg
        .append('path')
        .attr("class", "line");

    svg
        .append('circle')
        .attr("class", "comet")
        .attr("r", 5);

    var transition =  svg.transition()
        .transition()
        .ease('linear')
        .duration(duration);

    transition
        .selectAll('.line')
        .attrTween('d', getInterpolation(data, line));

    transition
        .selectAll('.comet')
        .attrTween('transform', delta(data, x, y));
}

function delta(data, xScale, yScale){
    return function(d, i, a) {
        var len = data.length;
        return function(t){
            var idx = Math.floor(t * len);
            var point = (idx < len)? data[idx] : data[len - 1];

            return "translate(" + xScale(point.x) + "," + yScale(point.y) + ")";
        }
    }

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
