import * as axios from "axios";

class Http {
    doGet(url,headers) {
        return this._toJSON(axios.get(url,headers ? { headers : headers } : null));
    }
    doPost(url,entity, headers) {
        return this._toJSON(axios.post(url,entity, headers ? { headers : headers } : null));
    }
    _toJSON(promise) {
        return new Promise((resolve,reject)=>{
            promise.then(response => {
                resolve(response.data);
            }).catch( err => {
                reject(err);
            })
        });
    }
}
export const http = new Http();