const storeData = async (key: string, value: string): Promise<any> => {
    try {
        const result = localStorage.setItem(key, value);
        return Promise.resolve(result)
    } catch (e) {
        console.error("storeData -> Error : ", e);
        return Promise.reject(e);
    }
};

const storeObject = async (key: string, object: {}): Promise<any> => {
    try {
        return storeData(key, JSON.stringify(object));
    } catch (e) {
        return Promise.reject(e);
    }
}

const getData = async (key: string): Promise<any> => {
    try {
        const value = localStorage.getItem(key);
        if (value !== null) {
            // value previously stored
            return Promise.resolve(value)
        }
        return Promise.resolve(undefined);
    } catch (e) {
        // error reading value
        console.error("getData -> Error : ", e);
        return Promise.reject(e);
    }
};


const getObject = async (key: string): Promise<any> => {
    try {
        const value = await getData(key);
        if (value === undefined) return Promise.resolve(undefined);
        return Promise.resolve(JSON.parse(value));
    } catch (e) {
        return Promise.reject(e);
    }
}

const insertInArray = async (arrayName: string, value: any): Promise<any> => {
    try {
        var old_array: any[] | undefined = await getObject(arrayName);
        if (old_array === undefined) old_array = [];
        else {
            old_array.push(value);
        }
        const result = await storeObject(arrayName, old_array);
        return Promise.resolve(result);
    } catch (e) {
        return Promise.reject(e);
    }
}

const retreiveOneInArray = async (arrayName: string, objectKey: string, objectValue: any): Promise<any> => {
    try {
        const datas: any[] | undefined = await getObject(arrayName);
        if (datas === undefined) return Promise.resolve(undefined);
        const findedEl = datas.find(el => el[objectKey] == objectValue);
        return Promise.resolve(findedEl);
    } catch (e) {
        return Promise.reject(e);
    }
}

const filterOneInArray = async (arrayName: string, filter: (el:any) => boolean ): Promise<any> => {
    try {
        const datas: any[] | undefined = await getObject(arrayName);
        if (datas === undefined) return Promise.resolve(undefined);
        const findedEl = datas.find(el => filter(el));
        return Promise.resolve(findedEl);
    } catch (e) {
        return Promise.reject(e);
    }
}

const retreiveAllInArray = async (arrayName: string, objectKey: string, objectValue: any): Promise<any> => {
    try {
        const datas: any[] | undefined = await getObject(arrayName);
        if (datas === undefined) return Promise.resolve(undefined);
        const findedEl = datas.filter(el => el[objectKey] == objectValue);
        return Promise.resolve(findedEl);
    } catch (e) {
        return Promise.reject(e);
    }
}

const filterAllInArray = async (arrayName: string, filter: (el:any)=> boolean): Promise<any> => {
    try {
        const datas: any[] | undefined = await getObject(arrayName);
        if (datas === undefined) return Promise.resolve(undefined);
        const findedEl = datas.filter(el => filter(el));
        return Promise.resolve(findedEl);
    } catch (e) {
        return Promise.reject(e);
    }
}

const deleteInArray = async (arrayName: string, objectKey: string, objectValue: any): Promise<any> => {
    try {
        const datas: [] | undefined = await getObject(arrayName);
        if (datas !== undefined) {
            const filteredDatas = datas.filter(el => el[objectKey] == objectValue);
            await storeObject(arrayName, filteredDatas)
        }
    } catch (e) {
        return Promise.reject(e);
    }
}


const deleteData = async (key:string): Promise<any> => {
    try{
        const result = localStorage.removeItem(key);
        return Promise.resolve(result);
    }catch(e){  
        return Promise.reject(e);
    }
}

const updateDataInArray = async (arrayName: string, objectKey: string, objectValue: any, newValues: any, merge: boolean = true, createIfNotExist: boolean = false) : Promise<any>=>{
    try{    
        var array = await getObject(arrayName);
        if(array === undefined) return Promise.resolve(undefined);
        const findedEl = array.find((el:any) => el[objectKey] == objectValue);
        if(findedEl === undefined) {
            if(createIfNotExist === false) return Promise.resolve(undefined);
            else array.push(newValues)
        }
        array = array.map((el:any) => {
            if(el[objectKey] == objectValue){
                if(merge){
                    return {...el,...newValues}
                }else{
                    return newValues;
                }
            }
            return el;
        })
        await storeObject(arrayName, array);
    }catch(e){
        return Promise.reject(e);
    }
}

export default {
    storeData,
    storeObject,

    getData,
    getObject,

    filterOneInArray,
    filterAllInArray,

    insertInArray,
    retreiveOneInArray,
    retreiveAllInArray,
    deleteInArray,
    deleteData,

    updateDataInArray
}