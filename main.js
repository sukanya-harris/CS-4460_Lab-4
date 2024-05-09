// Global function called when select element is changed
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    var category = select.options[select.selectedIndex].value;
    // Update chart with the selected category of cereal
    updateChart(category);
}

// recall that when data is loaded into memory, numbers are loaded as strings
// this function helps convert numbers into string during data preprocessing
function dataPreprocessor(row) {
    return {
        cerealName: row['Cereal Name'],
        manufacturer: row['Manufacturer'],
        sugar: +row['Sugars']
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = { t: 60, r: 20, b: 80, l: 60 };

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Variable for the spacing of bar charts
var barBand;
var barWidth;

// scales
var sugarScale; // y axis
var xBandScale; // x axis

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', `translate(${padding.l}, ${padding.t})`);

var data;
var cutoffValue = 0;
var count = 0;
var temp = 0;

d3.csv('cereals.csv', dataPreprocessor).then(function(dataset) {
    // Create global variables here and intialize the chart
    data = dataset;
    sugarScale = d3.scaleLinear();
    sugarScale.domain([0, 15]).range([chartHeight, 0]);

    // Compute the spacing for bar bands based on number of cereals
    barBand = chartWidth / data.length;
    barWidth = 0.7 * barBand;

    // **** Your JavaScript code goes here ****
    
    // Add axes to chart
    addAxes();
    // Update the chart for All cereals to initialize
    updateChart('All');
});

function addAxes() {
    // **** Draw the axes here ****
    chartG.append("g").call(d3.axisLeft(sugarScale));
    
}


function updateChart(manufacturer) {
    //  Create a filtered array of cereals based on the manufacturer
    var cereals;
    temp = manufacturer;
    if (manufacturer === 'All')
        cereals = data.filter(d => d.manufacturer !== manufacturer).filter(d => d.sugar >= cutoffValue);
    else cereals = data.filter(d => d.manufacturer === manufacturer).filter(d => d.sugar >= cutoffValue);

    // **** Draw and Update your chart here ****
    var filterButton = d3.select('#main')
    .append('p').append('button').style("border", "1px solid black").text('Filter Data')
    .on('click', function() {
        cutoffValue = document.querySelector('input').value;
        console.log(cutoffValue);
        updateChart(temp);
    });

    count = count + 1;
    if (count > 1) {
        filterButton.remove();
    }

    //cereals = data.filter(d => d.sugar >= cutoffValue);

    var bars = chartG.selectAll('.bar').data(cereals, function (d) {
        return d.cerealName;
    });
    var barsEnter = bars.enter().append('g').attr('class', 'bar');
    barsEnter.merge(bars).attr('transform', function (d, i) {
        return 'translate(' + (i * barBand + barWidth / 2) + ', ' + sugarScale(d['sugar']) + ")";
    }); 
    barsEnter.insert("rect").attr("height", function (d) {
        return chartHeight - sugarScale(d['sugar']);
    }).attr("width", barWidth);

    barsEnter.insert("text").attr("class", "axis label").text(function (d) {
        return d.cerealName;
    }).attr("text-anchor", "end").attr("transform", function (d) {
        return "translate("+ (barBand/2) +", " + (chartHeight - sugarScale(d['sugar']) + 10) + "), rotate(-45)"
    }).attr("font-size", "11px").attr("fill", "black").attr("font-weight", 600);

    bars.exit().remove();

    var title = chartG.append("text").attr("transform", "translate(200, -30)");
    title.text("Sugars In Cereal");
}

// Remember code outside of the data callback function will run before the data loads
