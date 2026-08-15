 
import { AuthentificationTokens } from "@/lib/data/interfaces";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";


interface InitialState {
    tokens?: AuthentificationTokens
    isAuthenticated: boolean
    isAuthChecked: boolean
}
const initialState: InitialState = {
    isAuthenticated: false,
    isAuthChecked: false
}
const slice = createSlice({
    name: "authentification",
    initialState,
    reducers: {
        setTokens: (state, action: PayloadAction<AuthentificationTokens>)=>{
            state.tokens = action.payload
        },
        delTokens: (state) => {
            // Corps explicite : un producteur Immer ne doit pas a la fois muter
            // le brouillon et renvoyer une valeur.
            state.tokens = undefined;
        },
        setIsAuthenticated: (state, action: PayloadAction<boolean>)=>{
            state.isAuthenticated = action.payload
        },
        setIsAuthChecked: (state, action: PayloadAction<boolean>)=>{
            state.isAuthChecked = action.payload
        }
    }
});


const authentificationReducer = {
    reducer: slice.reducer,
    actions: slice.actions,
};

export default authentificationReducer;
