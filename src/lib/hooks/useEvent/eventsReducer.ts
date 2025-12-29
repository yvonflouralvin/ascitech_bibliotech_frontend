import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface InitialState {
    events: {eventId:string, payload:{}, uuid:string}[]
}
const initialState: InitialState = {
    events:[]
}

const slice = createSlice({
    name:"event",
    initialState,
    reducers: {
        addEventInPipe: (state, action: PayloadAction<{eventId:string, payload:{}}>)=>{
            state.events.push({
                ...action.payload,
                uuid: `e-${new Date().getTime()}-${state.events.length+1}`
            })
        },
        dropEvent: (state, action)=>{
            state.events = state.events.filter(e=>e.uuid!== action.payload);
        }
    }
})


export default {
    reducer: slice.reducer,
    actions: slice.actions
}