import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux' 
import eventsReducer from '../hooks/useEvent/eventsReducer'
import authentificationReducer from '../hooks/authentification/authentificationReducer' 
import bookReducer from '../hooks/useBook/bookReducer'

export const store = configureStore({
    reducer: {
        eventsReducer: eventsReducer.reducer,
        authentificationReducer: authentificationReducer.reducer,
        bookReducer: bookReducer.reducer
    }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()