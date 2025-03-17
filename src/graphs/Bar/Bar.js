import * as d3 from 'd3';

export const BarProducer = (data, asset, timespan, theme) => {
    if (!data.length) return; 
    

    d3.select(".display-graph-container").select("svg").remove();
    d3.select("#tooltip").remove();

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

    // Format date for display - standard version first
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toISOString().split("T")[0];
    };

    // Determine if we should aggregate data (only for minute and hour timespans)
    let displayData = data;
    let isAggregated = false;
    
    if (timespan.timespanType === "minute" || timespan.timespanType === "hour") {
        isAggregated = true;
        // Aggregate by day for minute/hour data
        const dayGroups = {};
        
        data.forEach(d => {
            const date = new Date(d.t);
            // Get date string as key (YYYY-MM-DD)
            const dayKey = date.toISOString().split('T')[0];
            
            if (!dayGroups[dayKey]) {
                dayGroups[dayKey] = {
                    points: [],
                    dayStart: new Date(date)
                };
                // Set to start of day
                dayGroups[dayKey].dayStart.setHours(0, 0, 0, 0);
            }
            
            dayGroups[dayKey].points.push(d);
        });
        
        // Create aggregated data points for each day
        displayData = Object.values(dayGroups).map(day => {
            // Sort by timestamp to ensure first/last are correct
            day.points.sort((a, b) => a.t - b.t);
            
            const aggregatedPoint = {
                t: day.dayStart.getTime(),
                o: day.points[0].o, // Opening price (from first point)
                c: day.points[day.points.length - 1].c, // Closing price (from last point)
                h: d3.max(day.points, d => d.h), // Highest high
                l: d3.min(day.points, d => d.l), // Lowest low
                v: d3.sum(day.points, d => d.v), // Sum of volume
                dataPoints: day.points.length // Store number of aggregated points
            };
            return aggregatedPoint;
        });
        
        // Sort by date
        displayData.sort((a, b) => a.t - b.t);
    }
    // x scale: using date strings as categories
    const x = d3
        .scaleBand()
        .domain(displayData.map((d) => formatDate(d.t)))
        .range([0, width])
        .padding(0.2); // Increased padding for better spacing

    // y scale: based on closing price with padding
    const y = d3
        .scaleLinear()
        .domain([0, d3.max(displayData, (d) => d.c) * 1.05]) // 5% padding at the top
        .nice()
        .range([height, 0]);

    // Define gradients with better colors
    const defs = svg.append("defs");

    // Create gradients for different price changes
    const positiveGradientId = "positiveBarGradient-" + Math.random().toString(36).substring(2, 9);
    const negativeGradientId = "negativeBarGradient-" + Math.random().toString(36).substring(2, 9);
    const neutralGradientId = "neutralBarGradient-" + Math.random().toString(36).substring(2, 9);

    // Positive gradient (price increase)
    const positiveGradient = defs
        .append("linearGradient")
        .attr("id", positiveGradientId)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");

    positiveGradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", theme.themeType === "DARK" ? "#4caf50" : "#66bb6a");

    positiveGradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", theme.themeType === "DARK" ? "#1b5e20" : "#43a047");

    // Negative gradient (price decrease)
    const negativeGradient = defs
        .append("linearGradient")
        .attr("id", negativeGradientId)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");

    negativeGradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", theme.themeType === "DARK" ? "#f44336" : "#ef5350");

    negativeGradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", theme.themeType === "DARK" ? "#b71c1c" : "#c62828");

    // Neutral gradient (no change or first point)
    const neutralGradient = defs
        .append("linearGradient")
        .attr("id", neutralGradientId)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");

    neutralGradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", theme.themeType === "DARK" ? "#9c27b0" : "#ab47bc");

    neutralGradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", theme.themeType === "DARK" ? "#4a148c" : "#8e24aa");

    // Add a grid for better readability (before bars so they're on top of the grid)
    svg.append("g")            
        .attr("class", "grid")
        .style("stroke", theme.themeType === "DARK" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)")
        .style("stroke-dasharray", "3,3")
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
        );

    // Helper function to determine price change
    const getPriceChange = (d, i) => {
        if (i === 0) return "neutral";
        const prevClose = displayData[i - 1]?.c;
        if (!prevClose) return "neutral";
        if (d.c > prevClose) return "positive";
        if (d.c < prevClose) return "negative";
        return "neutral";
    };

    // Helper function to get appropriate gradient based on price change
    const getGradient = (d, i) => {
        const change = getPriceChange(d, i);
        if (change === "positive") return `url(#${positiveGradientId})`;
        if (change === "negative") return `url(#${negativeGradientId})`;
        return `url(#${neutralGradientId})`;
    };

    // Create bars with tooltip interactions and color-coded by price change
    svg
        .selectAll(".bar")
        .data(displayData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(formatDate(d.t)))
        .attr("width", x.bandwidth())
        .attr("y", height) // Start from the bottom for animation
        .attr("height", 0)
        .attr("fill", (d, i) => getGradient(d, i))
        .attr("data-original-fill", (d, i) => getGradient(d, i))
        .attr("rx", 3) // Rounded corners
        .attr("ry", 3)
        .style("filter", theme.themeType === "DARK" ? 
            "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))" : 
            "drop-shadow(0px 2px 2px rgba(0,0,0,0.1))")
        .on("mouseover", function (event, d) {
            // Highlight the bar
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", theme.themeType === "DARK" ? "#ff9800" : "#ffa726");
            
            // Calculate price change percentage
            const index = displayData.findIndex(item => item.t === d.t);
            const prevClose = index > 0 ? displayData[index - 1].c : d.c;
            const changeAmount = d.c - prevClose;
            const changePercent = ((d.c - prevClose) / prevClose * 100).toFixed(2);
            
            // Format currency
            const formattedPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(d.c);
            
            // Format date
            const dateObj = new Date(d.t);
            const formattedDate = dateObj.toLocaleDateString();
            
            // Create tooltip content - different for aggregated vs non-aggregated
            let tooltipContent = `
                <div style="font-weight: bold; border-bottom: 1px solid ${theme.themeType === "DARK" ? "#555" : "#ddd"}; padding-bottom: 5px; margin-bottom: 5px; text-align: center;">
                    ${formattedDate}
                    ${isAggregated ? `<span style="display: block; font-size: 11px; opacity: 0.8;">(Daily Aggregate: ${d.dataPoints} data points)</span>` : ''}
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
            `;
            
            // Show enhanced tooltip
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0.95);
            tooltip
                .html(tooltipContent)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px");
        })
        .on("mousemove", function (event) {
            // Update tooltip position on mouse move
            tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function () {
            // FIX: More carefully revert bar appearance without causing it to disappear
            const originalFill = d3.select(this).attr("data-original-fill");
            d3.select(this)
                .transition()
                .duration(2)
                .attr("fill", originalFill)
                

            // Hide tooltip
            tooltip.transition().duration(300).style("opacity", 0);
        })
        .transition()
        .duration(1500)
        .delay((d, i) => Math.min(i * 15, 2000)) // Cap delay to prevent too long animations
        .attr("y", (d) => y(d.c))
        .attr("height", (d) => height - y(d.c));

    // Filter the ticks based on data length for better readability
    const tickValues = (() => {
        if (displayData.length <= 10) {
            // Show all ticks for 10 or fewer data points
            return displayData.map(d => formatDate(d.t));
        } else if (displayData.length <= 30) {
            // Show every 2nd tick for 11-30 data points
            return displayData
                .filter((_, i) => i % 2 === 0)
                .map(d => formatDate(d.t));
        } else if (displayData.length <= 60) {
            // Show every 5th tick for 31-60 data points
            return displayData
                .filter((_, i) => i % 5 === 0)
                .map(d => formatDate(d.t));
        } else {
            // Show every 10th tick for 61+ data points
            return displayData
                .filter((_, i) => i % 10 === 0)
                .map(d => formatDate(d.t));
        }
    })();

    // Format tick text
    const formatTickText = (d) => {
        const date = new Date(d);
        // For many data points, show just month/day
        if (displayData.length > 30) {
            return `${date.getMonth()+1}/${date.getDate()}`;
        }
        return d;
    };

    // Append x-axis with filtered ticks
    const xAxis = svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
            d3.axisBottom(x)
                .tickValues(tickValues)
                .tickFormat(formatTickText)
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

    // Style axis elements for dark theme
    xAxis.selectAll("text").style("fill", theme.themeType === "DARK" ? "white" : "black");
    yAxis.selectAll("text").style("fill", theme.themeType === "DARK" ? "white" : "black");
    xAxis.selectAll("path, line").style("stroke", theme.themeType === "DARK" ? "white" : "black");
    yAxis.selectAll("path, line").style("stroke", theme.themeType === "DARK" ? "white" : "black");

    // Calculate summary statistics
    const latestClose = displayData[displayData.length - 1].c;
    const firstClose = displayData[0].c;
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
        .text(`${asset.assetType} Stock Price (${timespan.timespanType}${isAggregated ? ", Daily Aggregated" : ""})`);
        
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
    const avgPrice = d3.mean(displayData, d => d.c);
    
    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(avgPrice))
        .attr("y2", y(avgPrice))
        .style("stroke", theme.themeType === "DARK" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)")
        .style("stroke-width", 1)
        .style("stroke-dasharray", "4,4")
        .style("opacity", 0)
        .transition()
        .delay(2000)
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
        .delay(2000)
        .duration(500)
        .style("opacity", 1);

    // Add annotations for highest and lowest values
    // Maximum point with annotation
    const maxPoint = displayData.find(d => d.c === d3.max(displayData, d => d.c));
    svg.append("circle")
        .attr("cx", x(formatDate(maxPoint.t)) + x.bandwidth() / 2)
        .attr("cy", y(maxPoint.c))
        .attr("r", 4)
        .style("fill", "#ffeb3b")
        .style("stroke", theme.themeType === "DARK" ? "#333" : "white")
        .style("stroke-width", 2)
        .style("opacity", 0)
        .transition()
        .delay(2000)
        .duration(500)
        .style("opacity", 1);
        
    svg.append("text")
        .attr("x", x(formatDate(maxPoint.t)) + x.bandwidth() / 2)
        .attr("y", y(maxPoint.c) - 10)
        .attr("text-anchor", "middle")
        .style("fill", theme.themeType === "DARK" ? "#ffeb3b" : "#ff6d00")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text("High: $" + maxPoint.c.toFixed(2))
        .transition()
        .delay(2000)
        .duration(500)
        .style("opacity", 1);

    // Minimum point with annotation
    const minPoint = displayData.find(d => d.c === d3.min(displayData, d => d.c));
    if (minPoint.t !== maxPoint.t) {
        svg.append("circle")
            .attr("cx", x(formatDate(minPoint.t)) + x.bandwidth() / 2)
            .attr("cy", y(minPoint.c))
            .attr("r", 4)
            .style("fill", theme.themeType === "DARK" ? "#ff5252" : "#d50000")
            .style("stroke", theme.themeType === "DARK" ? "#333" : "white")
            .style("stroke-width", 2)
            .style("opacity", 0)
            .transition()
            .delay(2000)
            .duration(500)
            .style("opacity", 1);
            
        svg.append("text")
            .attr("x", x(formatDate(minPoint.t)) + x.bandwidth() / 2)
            .attr("y", y(minPoint.c) - 10)
            .attr("text-anchor", "middle")
            .style("fill", theme.themeType === "DARK" ? "#ff5252" : "#d50000")
            .style("font-size", "11px")
            .style("font-weight", "bold")
            .style("opacity", 0)
            .text("Low: $" + minPoint.c.toFixed(2))
            .transition()
            .delay(2000)
            .duration(500)
            .style("opacity", 1);
    }
};
