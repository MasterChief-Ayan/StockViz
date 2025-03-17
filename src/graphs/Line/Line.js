import * as d3 from 'd3';

export const LineProducer = (data, asset, timespan, theme) => {
    if (!data.length) return; // Wait for data
    
    // Remove any existing SVG and tooltip to prevent duplicates
    d3.select(".display-graph-container").select("svg").remove();
    d3.select("#tooltip").remove();

    // Create tooltip with enhanced styling
    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("background", theme.themeType === "DARK" ? "#333" : "white")
        .style("color", theme.themeType === "DARK" ? "white" : "black")
        .style("padding", "12px")
        .style("border", theme.themeType === "DARK" ? "1px solid #555" : "1px solid #ccc")
        .style("border-radius", "8px")
        .style("box-shadow", theme.themeType === "DARK" ? "0 2px 8px rgba(255,255,255,0.15)" : "0 2px 8px rgba(0,0,0,0.15)")
        .style("pointer-events", "none")
        .style("font-size", "13px")
        .style("z-index", "1000")
        .style("transition", "all 0.2s ease");

    // Get container width for responsive sizing
    const container = d3.select(".display-graph-container").node();
    const containerWidth = container ? container.getBoundingClientRect().width : 800;

    // Chart dimensions and margins
    const margin = { top: 30, right: 30, bottom: 60, left: 70 }, 
        width = containerWidth - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Append SVG element inside ".display-graph-container"
    const svg = d3
        .select(".display-graph-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);



    // Find min and max values for annotations
    const maxDataPoint = data.reduce((max, p) => p.c > max.c ? p : max, data[0]);
    const minDataPoint = data.reduce((min, p) => p.c < min.c ? p : min, data[0]);

    // Sort data by date for proper line drawing
    data.sort((a, b) => a.t - b.t);

    // x scale: time scale for dates
    const x = d3
        .scaleTime()
        .domain(d3.extent(data, d => new Date(d.t)))
        .range([0, width]);

    // y scale: based on closing price with padding
    const y = d3
        .scaleLinear()
        .domain([
            d3.min(data, d => d.c) * 0.95, // 5% padding below minimum
            d3.max(data, d => d.c) * 1.05  // 5% padding above maximum
        ])
        .nice()
        .range([height, 0]);

    // Define gradient for area under the line
    const defs = svg.append("defs");
    const areaGradientId = "line-area-gradient-" + Math.random().toString(36).substring(2, 9);

    // Create area gradient
    const areaGradient = defs
        .append("linearGradient")
        .attr("id", areaGradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

    areaGradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", theme.themeType === "DARK" ? "#4fc3f7" : "#29b6f6")
        .attr("stop-opacity", 0.7);

    areaGradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", theme.themeType === "DARK" ? "#0d47a1" : "#e1f5fe")
        .attr("stop-opacity", 0.1);
        
    // Create gradient for the line itself
    const lineGradientId = "line-gradient-" + Math.random().toString(36).substring(2, 9);
    const lineGradient = defs
        .append("linearGradient")
        .attr("id", lineGradientId)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", y(d3.min(data, d => d.c)))
        .attr("x2", 0)
        .attr("y2", y(d3.max(data, d => d.c)));
        
    lineGradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", theme.themeType === "DARK" ? "#00e676" : "#00c853");
        
    lineGradient
        .append("stop")
        .attr("offset", "50%")
        .attr("stop-color", theme.themeType === "DARK" ? "#2196f3" : "#1976d2");
        
    lineGradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", theme.themeType === "DARK" ? "#f06292" : "#ec407a");

    // Add a grid for better readability
    svg.append("g")            
        .attr("class", "grid")
        .style("stroke", theme.themeType === "DARK" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)")
        .style("stroke-dasharray", "3,3")
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
        );

    // Define the area generator
    const area = d3.area()
        .x(d => x(new Date(d.t)))
        .y0(height)
        .y1(d => y(d.c))
        .curve(d3.curveMonotoneX); // Smoother curve

    // Add area under the line
    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("fill", `url(#${areaGradientId})`)
        .attr("d", area)
        .attr("opacity", 0)
        .transition()
        .duration(2000)
        .attr("opacity", 0.8);

    // Define the line generator
    const line = d3.line()
        .x(d => x(new Date(d.t)))
        .y(d => y(d.c))
        .curve(d3.curveMonotoneX); // Smoother curve
        
    // Add vertical reference line for mouseover
    const verticalLine = svg.append("line")
        .attr("class", "vertical-line")
        .attr("y1", 0)
        .attr("y2", height)
        .style("stroke", theme.themeType === "DARK" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)")
        .style("stroke-width", 1)
        .style("stroke-dasharray", "3,3")
        .style("pointer-events", "none")
        .style("display", "none");

    // Add the path (the line itself)
    const path = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", `url(#${lineGradientId})`)
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("d", line);
    
    // Add line animation - draw line gradually
    const pathLength = path.node().getTotalLength();
    path
        .attr("stroke-dasharray", pathLength + " " + pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Add circles for each data point with interactive tooltips
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(new Date(d.t)))
        .attr("cy", d => y(d.c))
        .attr("r", 0) // Start with 0 radius for animation
        .style("fill", theme.themeType === "DARK" ? "#e1f5fe" : "#01579b")
        .style("stroke", theme.themeType === "DARK" ? "#0d47a1" : "#b3e5fc")
        .style("stroke-width", 2)
        .style("opacity", 0.7)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            // Enlarge the dot
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 8)
                .style("opacity", 1)
                .style("fill", theme.themeType === "DARK" ? "#ffab40" : "#ff6d00");
            
            // Calculate price change percentage
            const index = data.findIndex(item => item.t === d.t);
            const prevClose = index > 0 ? data[index - 1].c : d.c;
            const changeAmount = d.c - prevClose;
            const changePercent = ((d.c - prevClose) / prevClose * 100).toFixed(2);
            
            // Format currency for display
            const formattedPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(d.c);
            
            // Show tooltip with rich information
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0.95);
            tooltip
                .html(`
                    <div style="font-weight: bold; border-bottom: 1px solid ${theme.themeType === "DARK" ? "#555" : "#ddd"}; padding-bottom: 5px; margin-bottom: 5px; text-align: center;">
                        ${new Date(d.t).toLocaleDateString()} (${timespan.timespanType})
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span>Close:</span>
                        <span style="font-weight: bold; color: ${changeAmount >= 0 ? '#4caf50' : '#f44336'}">${formattedPrice}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span>Change:</span>
                        <span style="font-weight: bold; color: ${changeAmount >= 0 ? '#4caf50' : '#f44336'}">
                            ${changeAmount >= 0 ? '+' : ''}${changeAmount.toFixed(2)} (${changeAmount >= 0 ? '+' : ''}${changePercent}%)
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span>Open:</span>
                        <span>${d.o ? new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(d.o) : 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span>High:</span>
                        <span>${d.h ? new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(d.h) : 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span>Low:</span>
                        <span>${d.l ? new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(d.l) : 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span>Volume:</span>
                        <span>${d.v ? d.v.toLocaleString() : 'N/A'}</span>
                    </div>
                `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px");
                
            // Show vertical reference line
            verticalLine
                .attr("x1", x(new Date(d.t)))
                .attr("x2", x(new Date(d.t)))
                .style("display", "block");
        })
        .on("mousemove", function (event) {
            // Update tooltip position on mouse move
            tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 4)
                .style("fill", theme.themeType === "DARK" ? "#e1f5fe" : "#01579b")
                .style("opacity", 0.7);
                
            // Hide tooltip
            tooltip.transition().duration(300).style("opacity", 0);
            
            // Hide vertical line
            verticalLine.style("display", "none");
        })
        .transition()
        .delay((d, i) => 2000 + i * 20) // Start after line animation
        .duration(100)
        .attr("r", 4); // Final radius

    // Calculate appropriate tick values based on data density
    const xTickCount = Math.min(10, data.length);
    const yTickCount = 8;

    // Append x-axis with date formatting
    const xAxis = svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
            d3.axisBottom(x)
                .ticks(xTickCount)
                .tickFormat(date => {
                    // Format based on timespan
                    if (timespan.timespanType === "day" || timespan.timespanType === "week") {
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } else if (timespan.timespanType === "month") {
                        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    } else {
                        return date.toLocaleDateString();
                    }
                })
        );

    // Rotate tick labels for better readability
    xAxis
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .style("fill", theme.themeType === "DARK" ? "white" : "black");

    // Append y-axis with currency format for price
    const yAxis = svg
        .append("g")
        .call(
            d3.axisLeft(y)
                .ticks(yTickCount)
                .tickFormat(d => `$${d}`)
        );

    // Axis labels with nicer styling
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .style("fill", theme.themeType === "DARK" ? "white" : "black")
        .style("font-size", "12px")
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .style("fill", theme.themeType === "DARK" ? "white" : "black")
        .style("font-size", "12px")
        .text("Closing Price ($)");

    // Change text and axis line colors for dark theme
    xAxis.selectAll("text").style("fill", theme.themeType === "DARK" ? "white" : "black");
    yAxis.selectAll("text").style("fill", theme.themeType === "DARK" ? "white" : "black");
    xAxis.selectAll("path, line").style("stroke", theme.themeType === "DARK" ? "white" : "black");
    yAxis.selectAll("path, line").style("stroke", theme.themeType === "DARK" ? "white" : "black");

    // Add annotations for highest and lowest values with animation
    // Maximum point annotation
    svg.append("circle")
        .attr("cx", x(new Date(maxDataPoint.t)))
        .attr("cy", y(maxDataPoint.c))
        .attr("r", 6)
        .style("fill", "#ffeb3b")
        .style("stroke", theme.themeType === "DARK" ? "#333" : "white")
        .style("stroke-width", 2)
        .style("opacity", 0)
        .transition()
        .delay(2500)
        .duration(500)
        .style("opacity", 1);
        
    svg.append("text")
        .attr("x", x(new Date(maxDataPoint.t)))
        .attr("y", y(maxDataPoint.c) - 15)
        .attr("text-anchor", "middle")
        .style("fill", theme.themeType === "DARK" ? "#ffeb3b" : "#ff6d00")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text("High: $" + maxDataPoint.c.toFixed(2))
        .transition()
        .delay(2500)
        .duration(500)
        .style("opacity", 1);

    // Minimum point annotation
    svg.append("circle")
        .attr("cx", x(new Date(minDataPoint.t)))
        .attr("cy", y(minDataPoint.c))
        .attr("r", 6)
        .style("fill", theme.themeType === "DARK" ? "#ff5252" : "#d50000")
        .style("stroke", theme.themeType === "DARK" ? "#333" : "white")
        .style("stroke-width", 2)
        .style("opacity", 0)
        .transition()
        .delay(2500)
        .duration(500)
        .style("opacity", 1);
        
    svg.append("text")
        .attr("x", x(new Date(minDataPoint.t)))
        .attr("y", y(minDataPoint.c) - 15)
        .attr("text-anchor", "middle")
        .style("fill", theme.themeType === "DARK" ? "#ff5252" : "#d50000")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text("Low: $" + minDataPoint.c.toFixed(2))
        .transition()
        .delay(2500)
        .duration(500)
        .style("opacity", 1);

    // Calculate summary statistics
    const latestClose = data[data.length - 1].c;
    const firstClose = data[0].c;
    const totalChange = latestClose - firstClose;
    const percentChange = (totalChange / firstClose * 100).toFixed(2);
    
    // Add chart title with performance summary
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", theme.themeType === "DARK" ? "white" : "black")
        .text(`${asset.assetType} Stock Price Trends (${timespan.timespanType})`);
        
    // Add subtitle with performance metrics
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", totalChange >= 0 ? 
            (theme.themeType === "DARK" ? "#4caf50" : "#2e7d32") : 
            (theme.themeType === "DARK" ? "#f44336" : "#c62828"))
        .text(`${totalChange >= 0 ? "+" : ""}${totalChange.toFixed(2)} (${totalChange >= 0 ? "+" : ""}${percentChange}%)`);
        
    // Add average line
    const avgPrice = d3.mean(data, d => d.c);
    
    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(avgPrice))
        .attr("y2", y(avgPrice))
        .style("stroke", theme.themeType === "DARK" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)")
        .style("stroke-width", 1.5)
        .style("stroke-dasharray", "5,5")
        .style("opacity", 0)
        .transition()
        .delay(2500)
        .duration(500)
        .style("opacity", 1);
        
    svg.append("text")
        .attr("x", width - 5)
        .attr("y", y(avgPrice) - 5)
        .attr("text-anchor", "end")
        .style("fill", theme.themeType === "DARK" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)")
        .style("font-size", "11px")
        .text(`Avg: $${avgPrice.toFixed(2)}`)
        .style("opacity", 0)
        .transition()
        .delay(2500)
        .duration(500)
        .style("opacity", 1);
};