import { Book } from "../useBook/type";
import useIndexedDB from "../useIndexedDB";

const useFavori = ()=>{


    const {
        put, 
        db, 
        deleteById,
        getAll,
        get
    } = useIndexedDB<Book>("booksfavorites");


    return {
        addToFavorite: put,
        removeToFavorite: deleteById,
        getFavorites : getAll,
        dbFavorite: db,
        isFavorite: get
    }

}


export default useFavori;