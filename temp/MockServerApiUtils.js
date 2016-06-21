import "es6-shim";
import {PathResponse} from "./ResponseHandler"


export class MockServerApi {
    constructor(http, serverUrl, adminPath,mockApiPath) {
        this.http = http;
        this.serverUrl = serverUrl;
        this.adminPath = adminPath;
        this.mockApiPath = mockApiPath;
    }

    mockApiRequest() {
        return new MockApiRequest(this.http, this.serverUrl, this.adminPath, this.mockApiPath);
    }
    getResponses(path, method, status) {
        return this.http.doPost(this.serverUrl + this.adminPath + "/list", {
            path : path,
            method : method,
            status : status
        });
    }
    reset() {
        return new Promise((resolve, reject)=> {
            var url = this.serverUrl + this.adminPath + "/reset";
            this.http.doGet(url, {
                "Content-Type" : "application/json"
            }).then(()=> {
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    }
}

export class HttpProvider {
    doGet(url,headers){}
    doPost(url,entity,headers){}
}


export class MockApiRequest {
    constructor(http, serverUrl, adminPath, mockApiPath, pathResponse) {
        this.http = http;
        this.serverUrl = serverUrl;
        this.adminPath = adminPath;
        this.mockApiPath = mockApiPath;
        if(typeof pathResponse == "undefined") {
            this.pathResponse = new PathResponse();
        } else {
            this.pathResponse = pathResponse;
        }
    }

    _clone(pathResponse) {
        return new MockApiRequest(this.http, this.serverUrl, this.adminPath, this.mockApiPath, pathResponse);
    }

    path(path) {
        return this._clone(this.pathResponse.setPath(path));
    }

    method(method) {
        return this._clone(this.pathResponse.setMethod(method));
    }

    status(status) {
        return this._clone(this.pathResponse.setResponseHttpStatus(status));
    }

    body(body) {
        return this._clone(this.pathResponse.setResponseBody(body));
    }

    headers(headers) {
        return this._clone(this.pathResponse.setResponseHeaders(headers));
    }

    execute() {
        this._verify();
        return new Promise((resolve, reject)=> {
            var url = this.serverUrl + this.adminPath + "/add";
            this.http.doPost(url, this.pathResponse, {
                "Content-Type": "application/json"
            }).then((response)=> {
                resolve({pathResponse: this.pathResponse, url: this.serverUrl + this.mockApiPath + this.pathResponse.path});
            }).catch(err => {
                reject(err);
            });
        });
    }

    _verify() {
        if (!this.pathResponse.path) {
            throw new Error("Path is required, use path()");
        }
        if (!this.pathResponse.method) {
            throw new Error("Method is required, use method()");
        }
        if (!this.pathResponse.responseHttpStatus) {
            throw new Error("Status is required, use status()");
        }
    }


}
