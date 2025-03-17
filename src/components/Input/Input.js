import React from 'react'
import { useSelector,useDispatch } from 'react-redux'
import {graphActions,assetActions,timespanActions,dateActions} from "../../store/Store";
import './Input.css'

function Input() {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme);

  const changeGraphTypeHandler = (state) => {
    dispatch(graphActions.changeGraphType({type:state.target.value}));
  };
  const changeAssetTypeHandler = (state) => {
    dispatch(assetActions.changeAssetType({type:state.target.value}));
  };
  const changeTimespanTypeHandler = (state) => {
    dispatch(timespanActions.changeTimespanType({type:state.target.value}));
  };
  
  const changeStartDateHandler = (state) => {
      dispatch(dateActions.changeStartDate({date: state.target.value}));
  };

  const changeEndDateHandler = (state) => {
      dispatch(dateActions.changeEndDate({date: state.target.value}));
  };

  return (
    <div className={`input-container ${theme.themeType==="DARK"?"dark-bg":null}`}>
        <div className={`input  ${theme.themeType==="DARK"?"dark":null}`}>
            <div className='input-header'>
                <label>Graph Type: </label>
                <select onChange={changeGraphTypeHandler} className={`${theme.themeType==="DARK"?"dark-input":"input-field"}`}>
                <option value="NONE">Select</option>
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                </select>
            </div>
            <div className='input-header'>
                <label>Stock Type: </label>
                <select onChange={changeAssetTypeHandler} className={`${theme.themeType==="DARK"?"dark-input":"input-field"}`}>
                <option value="NONE">Select</option>
                <option value="AAPL">Apple</option>
                <option value="MSFT">Microsoft</option>
                <option value="TSLA">Tesla</option>
                <option value="BABA">Alibaba, ADR</option>
                <option value="QQQ">Nasdaq-100 ETF</option>
                </select>
            </div>

            <div  className='input-header'>
                <label>Timespan :</label>
                <select onChange={changeTimespanTypeHandler} className={`${theme.themeType==="DARK"?"dark-input":"input-field"}`}>
                <option value="NONE">Select</option>
                <option value="minute">Minute</option>
                <option value="hour">Hour </option>
                <option value="day">Day</option>
                <option value="week">Week</option>
                </select>
            </div>

            <div className='input-header'>
                <label>Start Date: </label>
                <input type="date" onChange={changeStartDateHandler} className={`${theme.themeType==="DARK"?"dark-input":"input-field"}`}/>
            </div>

            <div className='input-header'>
                <label>End Date: </label>
                <input type="date" onChange={changeEndDateHandler} className={`${theme.themeType==="DARK"?"dark-input":"input-field"}`}/>
            </div>


            
            

        </div>

    </div>
  )
}

export default Input