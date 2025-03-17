import React, { useEffect, useCallback, useState } from 'react'
import { useSelector } from 'react-redux'      
import './Display.css'
import { BarProducer } from '../../graphs/Bar/Bar';
import { LineProducer } from '../../graphs/Line/Line';
import { PieProducer } from '../../graphs/Pie/Pie';

function Display() {
    const timespan = useSelector(state => state.timespan);
    const asset = useSelector(state => state.asset);
    const graph = useSelector(state => state.graph);
    const theme = useSelector(state => state.theme);
    const date = useSelector(state => state.date);

    const [data, setData] = useState([]);

    // API CALLING FOR DYNAMIC UPDATE
    const fetchData = useCallback(async () => {
        try{
            const API="FpiLdAfNyu9VfbyQnDKmloVSfk_867ET";
            const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${asset.assetType}/range/1/${timespan.timespanType}/${date.startDate}/${date.endDate}?apiKey=${API}`);
            if(!response.ok) throw new Error("Error fetching data");
            const result = await response.json();
            setData(result.results);
            
        }
        catch(error) {
            console.error("Error fetching data @catch", error);
        }
    }, [timespan.timespanType, asset.assetType, date.startDate, date.endDate]); 

    useEffect(() => {
        if(graph.graphType !== "NONE" && asset.assetType !== "NONE" && timespan.timespanType !== "NONE" && date.startDate !== "NONE" && date.endDate !== "NONE"){
            fetchData();
        }
    }, [timespan.timespanType, asset.assetType, date.startDate, date.endDate, fetchData, graph.graphType]);

    useEffect(() => {
        
       switch (graph.graphType) {
            case "bar":
                BarProducer(data,asset,timespan,theme);
                break;
            case "line":
                LineProducer(data,asset,timespan,theme);
                break;
            case "pie":
                PieProducer(data,asset,timespan,theme);
                break;
            default:
                break
       }
            
    }, [data, theme.themeType, asset.assetType, timespan.timespanType]);
    
    return (
        <div className={`${theme.themeType === "DARK" ? "display-container-dark" : "display-container"}`}>
            
            <div className='display-graph-container'>
                {data.length === 0 && (
                    <div className="no-data-message" style={{ 
                        textAlign: 'center', 
                        paddingTop: '100px',
                        color: theme.themeType === "DARK" ? 'white' : 'black'
                    }}>
                        {(graph.graphType !== "NONE" && asset.assetType !== "NONE" && timespan.timespanType !== "NONE" && date.startDate !== "NONE" && date.endDate !== "NONE") ? 
                            "Loading data or no data available for the selected period..." : 
                            "Please select an asset and date range to view data"}
                    </div>
                )}
                <div className={`${theme.themeType === "DARK" ? "alert-dark" : "alert"}`}>
                    <h5>{data.length === 0 ? "No data available" : ""}</h5>
                    <h5>{data.length === 5000 ? "Refering top 5000 datas for optimization" : ""}</h5>
                </div>
            </div>
        </div>
    )
}

export default Display