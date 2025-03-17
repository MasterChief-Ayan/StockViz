import {createSlice,configureStore} from "@reduxjs/toolkit"

const graphSlice = createSlice({
    name:"graph",
    initialState:{
        graphType:"NONE"
    },
    reducers:{
        changeGraphType(state,action){
            state.graphType = action.payload.type;
        }
    }
});

const assetSlice = createSlice({
    name:"asset",
    initialState:{
        assetType:"NONE"
    },
    reducers:{
        changeAssetType(state,action){
            state.assetType = action.payload.type;
        }
    }
});

const timespanSlice = createSlice({
    name:"timespan",
    initialState:{
        timespanType:"NONE"
    },
    reducers:{
        changeTimespanType(state,action){
            state.timespanType = action.payload.type;
        }
    }
})

const themeSlice = createSlice({
    name:"theme",
    initialState:{
        themeType:"LIGHT"
    },
    reducers:{
        changeTheme(state,action){
            state.themeType = action.payload.type;
        }
    }
        
})

const dateSlice = createSlice({
    name: "date",
    initialState: {
        startDate: "NONE",
        endDate: "NONE"
    },
    reducers: {
        changeStartDate(state, action) {
            state.startDate = action.payload.date;
        },
        changeEndDate(state, action) {
            state.endDate = action.payload.date;
        }
    }
});

const Store=configureStore({
    reducer:{ graph:graphSlice.reducer,
              asset:assetSlice.reducer,
              timespan:timespanSlice.reducer,
              theme:themeSlice.reducer,
              date:dateSlice.reducer
    }})


export default Store

export const graphActions = graphSlice.actions;
export const assetActions = assetSlice.actions;
export const timespanActions = timespanSlice.actions;
export const themeActions = themeSlice.actions;
export const dateActions = dateSlice.actions;