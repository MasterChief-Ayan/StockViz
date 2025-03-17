import * as d3 from 'd3';

export const PieProducer = (data, asset, timespan, theme) => {
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

    // Get container width and height for responsive sizing
    const container = d3.select(".display-graph-container").node();
    const containerWidth = container ? container.getBoundingClientRect().width : 800;
    const containerHeight = 500;

    // Chart dimensions with margins
    const margin = { top: 50, right: 20, bottom: 50, left: 20 },
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

    // Determine the radius of the pie chart
    const radius = Math.min(width, height) / 2;

    // Append SVG element inside ".display-graph-container"
    const svg = d3
        .select(".display-graph-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

    // Data preparation - Depending on what aspect we want to visualize
    // Here we'll group data by day and show volume distribution
    const dayVolumes = {};
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
    });

    // Process data for pie chart
    data.forEach(d => {
        // Format date for grouping
        const date = new Date(d.t);
        const dateStr = dateFormatter.format(date);
        
        // Sum volumes by day
        if (!dayVolumes[dateStr]) {
            dayVolumes[dateStr] = 0;
        }
        dayVolumes[dateStr] += d.v;
    });

    // Convert to array format needed for pie
    const pieData = Object.keys(dayVolumes).map(date => ({
        date: date,
        volume: dayVolumes[date]
    }));

    // Sort by volume descending
    pieData.sort((a, b) => b.volume - a.volume);

    // If too many slices, group smaller ones as "Others"
    const maxSlices = 15; // Maximum number of slices before grouping
    let processedPieData = [...pieData];
    
    if (pieData.length > maxSlices) {
        const mainSegments = pieData.slice(0, maxSlices - 1);
        const otherSegments = pieData.slice(maxSlices - 1);
        
        const otherVolume = otherSegments.reduce((sum, item) => sum + item.volume, 0);
        
        processedPieData = [
            ...mainSegments,
            {
                date: "Others",
                volume: otherVolume,
                isOthers: true,
                segments: otherSegments
            }
        ];
    }

    // Total volume for percentage calculations
    const totalVolume = d3.sum(pieData, d => d.volume);

    // Create more saturated color scale
    const colorScale = d3.scaleOrdinal()
        .domain(processedPieData.map(d => d.date))
        .range(theme.themeType === "DARK" 
            ? d3.schemeSet2 // More vibrant colors for dark theme
            : [                // More saturated colors for light theme
                "#ff7043", "#42a5f5", "#66bb6a", 
                "#ab47bc", "#ffca28", "#26c6da", 
                "#ec407a", "#7e57c2", "#9ccc65",
                "#5c6bc0", "#ff9800", "#29b6f6",
                "#f44336", "#2196f3", "#4caf50"
              ]);
    
    // Create gradients for enhanced visuals with more solid colors
    const defs = svg.append("defs");
    
    processedPieData.forEach((d, i) => {
        const gradientId = `pieGradient-${i}`;
        const gradient = defs.append("linearGradient")
            .attr("id", gradientId)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%");
            
        const baseColor = d3.rgb(colorScale(d.date));
        
        // Less brightening for more solid colors
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", baseColor.brighter(0.4));
            
        // Base color in the middle
        gradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", baseColor);
            
        // Less darkening for more solid colors
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", baseColor.darker(0.4));
    });
    
    // Create pie generator
    const pie = d3.pie()
        .value(d => d.volume)
        .sort(null); // Don't sort by value

    // Create the arc generator for pie slices
    const arc = d3.arc()
        .innerRadius(radius * 0.4) // Creates a donut chart, use 0 for pie
        .outerRadius(radius * 0.8);

    // Arc for hover state (slightly larger)
    const arcHover = d3.arc()
        .innerRadius(radius * 0.38)
        .outerRadius(radius * 0.85);

    // Arc for labels
    const outerArc = d3.arc()
        .innerRadius(radius * 0.95)
        .outerRadius(radius * 0.95);

    // Create pie chart slices with animated entry
    const slices = svg
        .selectAll(".arc")
        .data(pie(processedPieData))
        .enter()
        .append("g")
        .attr("class", "arc")
        .style("cursor", "pointer");

    // Add slices with gradient fill and animation
    slices.append("path")
        .style("fill", (d, i) => `url(#pieGradient-${i})`)
        .style("stroke", theme.themeType === "DARK" ? "#222" : "#fff")
        .style("stroke-width", 2)
        .style("opacity", 0.95) // Increased opacity for more solid look
        .on("mouseover", function(event, d) {
            // Animate slice on hover
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", arcHover)
                .style("opacity", 1)
                .style("stroke-width", 3);
            
            // Calculate percentage
            const percentage = ((d.data.volume / totalVolume) * 100).toFixed(1);
            
            // Format volume with comma separators
            const formattedVolume = d.data.volume.toLocaleString();
            
            // Show tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            
            let tooltipContent = `
                <div style="font-weight: bold; border-bottom: 1px solid ${theme.themeType === "DARK" ? "#555" : "#ddd"}; padding-bottom: 5px; margin-bottom: 5px; text-align: center; color: ${colorScale(d.data.date)}">
                    ${d.data.date}
                </div>
                <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                    <span>Volume:</span>
                    <span style="font-weight: bold;">${formattedVolume}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                    <span>Percentage:</span>
                    <span style="font-weight: bold;">${percentage}%</span>
                </div>
            `;
            
            // If this is the "Others" category, add extra info
            if (d.data.isOthers) {
                tooltipContent += `
                    <div style="margin-top: 8px; font-size: 11px; border-top: 1px solid ${theme.themeType === "DARK" ? "#555" : "#ddd"}; padding-top: 5px;">
                        <div style="font-style: italic; margin-bottom: 3px;">Includes ${d.data.segments.length} smaller segments</div>
                `;
                
                // Show top 3 others
                d.data.segments.slice(0, 3).forEach(segment => {
                    const segmentPercentage = ((segment.volume / totalVolume) * 100).toFixed(1);
                    tooltipContent += `
                        <div style="display: flex; justify-content: space-between; font-size: 10px; margin: 2px 0;">
                            <span>${segment.date}:</span>
                            <span>${segmentPercentage}%</span>
                        </div>
                    `;
                });
                
                if (d.data.segments.length > 3) {
                    tooltipContent += `<div style="font-size: 10px; text-align: center; margin-top: 3px;">...and ${d.data.segments.length - 3} more</div>`;
                }
                
                tooltipContent += `</div>`;
            }
            
            tooltip.html(tooltipContent)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px");
        })
        .on("mousemove", function(event) {
            tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function() {
            // Revert slice to original size
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", arc)
                .style("opacity", 0.95) // Restore to same opacity as initial
                .style("stroke-width", 2);
                
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition()
        .duration(1000)
        .attrTween("d", function(d) {
            // Animation for slice entry
            const interpolate = d3.interpolate(
                {startAngle: d.startAngle, endAngle: d.startAngle}, 
                {startAngle: d.startAngle, endAngle: d.endAngle}
            );
            return function(t) {
                return arc(interpolate(t));
            };
        });

    // Calculate and display key statistics
    const maxVolume = d3.max(pieData, d => d.volume);
    const minVolume = d3.min(pieData, d => d.volume);
    const maxDate = pieData.find(d => d.volume === maxVolume).date;
    const minDate = pieData.find(d => d.volume === minVolume).date;
    
    // Add title
    svg.append("text")
        .attr("x", 0)
        .attr("y", -radius - 15)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", theme.themeType === "DARK" ? "white" : "black")
        .text(`${asset.assetType} Trading Volume Distribution`);

    // Add subtitle with timespan
    svg.append("text")
        .attr("x", 0)
        .attr("y", -radius + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", theme.themeType === "DARK" ? "#ccc" : "#555")
        .text(`${timespan.timespanType} data`);

    // Center text with statistics
    const centerGroup = svg.append("g")
        .attr("class", "center-stats")
        .attr("text-anchor", "middle");
    
    centerGroup.append("text")
        .attr("y", -15)
        .style("font-size", "14px")
        .style("fill", theme.themeType === "DARK" ? "#e0e0e0" : "#333")
        .text("Total Volume");
    
    centerGroup.append("text")
        .attr("y", 15)
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", theme.themeType === "DARK" ? "white" : "black")
        .text(totalVolume.toLocaleString());

    // Add slice labels with connecting lines
    const labelThreshold = 0.05; // Only show labels for slices > 5% of total
    
    slices.each(function(d) {
        // Only add labels for significant slices
        if (d.data.volume / totalVolume >= labelThreshold) {
            const pos = outerArc.centroid(d);
            const midAngle = (d.startAngle + d.endAngle) / 2;
            
            // Position labels to left or right based on slice position
            pos[0] = radius * (midAngle < Math.PI ? 1 : -1);
            
            // Percentage for label
            const percentage = ((d.data.volume / totalVolume) * 100).toFixed(1);
            
            // Create label
            d3.select(this).append("text")
                .attr("transform", `translate(${pos})`)
                .attr("dy", "0.35em")
                .attr("text-anchor", midAngle < Math.PI ? "start" : "end")
                .style("fill", theme.themeType === "DARK" ? "white" : "black")
                .style("font-size", "12px")
                .style("opacity", 0)
                .text(`${d.data.date} (${percentage}%)`)
                .transition()
                .delay(1000) // Wait for slices to form
                .duration(500)
                .style("opacity", 1);
            
            // Create connecting line
            const innerPos = arc.centroid(d);
            const outerPos = outerArc.centroid(d);
            const posX = radius * 0.9 * (midAngle < Math.PI ? 1 : -1);
            
            d3.select(this).append("polyline")
                .attr("points", `${innerPos},${outerPos},${posX},${outerPos[1]}`)
                .style("fill", "none")
                .style("stroke", theme.themeType === "DARK" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)")
                .style("stroke-width", 1.5)
                .style("opacity", 0)
                .transition()
                .delay(1000) // Wait for slices to form
                .duration(500)
                .style("opacity", 0.7);
        }
    });

    // Add annotations for highest and lowest volume
    svg.append("text")
    .attr("class", "annotation")
    .attr("x", 0)
    .attr("y", radius + 5) // Reduced from +30 to +5
    .attr("text-anchor", "middle")
    .style("fill", theme.themeType === "DARK" ? "#ffc107" : "#ff6d00")
    .style("font-size", "12px")
    .style("opacity", 0)
    .html(`Highest Volume: <tspan style="font-weight: bold">${maxDate}</tspan> (${maxVolume.toLocaleString()})`)
    .transition()
    .delay(1500)
    .duration(500)
    .style("opacity", 1);

svg.append("text")
    .attr("class", "annotation")
    .attr("x", 0)
    .attr("y", radius + 25) // Reduced from +50 to +25
    .attr("text-anchor", "middle")
    .style("fill", theme.themeType === "DARK" ? "#4fc3f7" : "#0288d1")
    .style("font-size", "12px")
    .style("opacity", 0)
    .html(`Lowest Volume: <tspan style="font-weight: bold">${minDate}</tspan> (${minVolume.toLocaleString()})`)
    .transition()
    .delay(1600)
    .duration(500)
    .style("opacity", 1);

    // Add average volume information
    const avgVolume = totalVolume / pieData.length;
    const avgPercentage = (avgVolume / totalVolume * 100).toFixed(1);

    svg.append("text")
    .attr("x", 0)
    .attr("y", radius + 45) // Reduced from +70 to +45
    .attr("text-anchor", "middle")
    .style("fill", theme.themeType === "DARK" ? "#e0e0e0" : "#555")
    .style("font-size", "12px")
    .style("opacity", 0)
    .html(`Average Daily Volume: <tspan style="font-weight: bold">${avgVolume.toLocaleString()}</tspan> (${avgPercentage}%)`)
    .transition()
    .delay(1700)
    .duration(500)
    .style("opacity", 1);
};