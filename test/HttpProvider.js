import * as axios from "axios";
class Http {
    doGet(url,headers) {
        return axios.get(url,headers ? { headers : headers } : null);
    }
    doPost(url,entity, headers) {
        return axios.post(url,entity, headers ? { headers : headers } : null);
    }
}
export const http = new Http();