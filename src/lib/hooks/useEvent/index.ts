
import { useEffect } from 'react';
import eventsReducer from './eventsReducer'; 
import { useAppDispatch, useAppSelector } from '@/lib/shared/store';
import { Event } from '@/lib/data/interfaces';

const {
    addEventInPipe,
    dropEvent
} = eventsReducer.actions;

export default function useEvent(callback?: (eventId: string, payload: any) => void, listenIds: any[] = []) {

    const appDispatch = useAppDispatch();
    const {
        events
    } = useAppSelector(state => state.eventsReducer);

    const dispatch = (eventId: string, payload: {}) => {
        appDispatch(addEventInPipe({
            eventId,
            payload
        }))
    }

    useEffect(() => {
        if (callback !== undefined)
            events.map((event: Event) => {
                listenIds?.map(id => {
                    if (event.eventId == id) {
                        if (callback !== undefined)
                            callback(id, event.payload);

                        setTimeout(() => {
                            appDispatch(dropEvent(event.uuid));
                        }, 1000)
                    }
                })
            })
    }, [events]);


    return {
        dispatch
    }
}