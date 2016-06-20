import "es6-shim";
import axios from "axios";
import {PathResponse} from "../src/ResponseHandler"


export function mockRequest(baseUrl,adminPath, mockApiPath) {
    return new TestRequest(baseUrl,adminPath, mockApiPath);
}

export class TestRequest {
    constructor(serverUrl, adminPath, mockApiPath) {
        this.serverUrl = serverUrl;
        this.adminPath = adminPath;
        this.mockApiPath = mockApiPath;
        this.pathResponse = new PathResponse();
    }
    path(path) {
        this.pathResponse.path = path;
        return this;
    }
    method(method){
        this.pathResponse.method = method;
        return this;
    }
    status(status) {
        this.pathResponse.responseHttpStatus = status;return this;

    }
    body(body) {
        this.pathResponse.responseBody = body;
        return this;
    }
    headers(headers) {
        this.pathResponse.responseHeaders = headers;
    }
    execute() {
        return new Promise((resolve,reject)=>{
            var url = this.serverUrl + this.adminPath + "/add";
            console.log("Posting to   ", url, this.pathResponse);
            axios.post(url,this.pathResponse,{
                responseType: 'json',
                headers : {
                    "Content-Type" : "application/json"
                }
            }).then((response)=>{
                console.error("su ccess for  url " + url, this.pathResponse);
                resolve(this.createApiCall());
            }).catch(err => {
                console.error("error for url " + url, err, this.pathResponse );
                reject(err);
            });
        });
    }
    reset() {
        return new Promise((resolve,reject)=>{
            var url = this.serverUrl + this.adminPath + "/reset";
            console.log("Resetting mock server", url);
            axios.get(url,this.pathResponse,{
                responseType: 'json'
            }).then(()=>{
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    }
    createApiCall() {
        return ((requestUrl,pathResponse)=>{
            return () => {
                console.log("Calling mock api ", requestUrl);
                if(pathResponse.method == "GET") {
                    return axios.get(requestUrl,{
                        responseType: 'json',

                    });
                } else if(pathResponse.method == "POST") {
                    return axios.post(requestUrl,{ testContent : "abc" },{
                        responseType: 'json',
                    });
                }
            }
        })(this.serverUrl + this.mockApiPath + this.pathResponse.path, this.pathResponse);
    }
}
