import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import authentificationReducer from '../hooks/authentification/authentificationReducer';

/**
 * Le store ne porte plus que l'etat d'authentification : le catalogue, les
 * favoris et les pages telechargees vivent dans IndexedDB, seule source de
 * verite utilisable hors ligne.
 */
export const store = configureStore({
    reducer: {
        authentificationReducer: authentificationReducer.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
