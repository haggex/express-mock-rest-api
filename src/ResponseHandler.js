
export class PathResponse {
    constructor(path,method,status,body,headers) {
        this.path = path;
        this.method = method;
        this.responseHttpStatus = status;
        this.responseBody = body;
        this.responseHeaders = headers;
        this.requests = [];
    }
    onRequest(pathRequest) {
        this.requests.push(pathRequest);
    }
}
export class PathRequest {
    constructor(path,method,requestIndex, body,headers) {
        this.path = path;
        this.method = method;
        this.body = body;
        this.headers = headers;
        this.requestIndex = requestIndex;
    }
}

export class PathMapping {

    constructor(path,method){
        this.path = path;
        this.method = method;
        this.responses = [];
        this.currentResponse = 0;
    }
    addResponse(pathResponse) {
        this.responses.push(pathResponse);
    }
    getNrOfRequests() {
        return this.responses.reduce((prev,current)=>{
            var prevLength = prev.requests.length;
            return (prevLength ? prevLength : 0)  + current.requests.length;
        });
    }
    getNextResponse(pathRequest) {
        var r = this.responses[this.currentResponse];
        if(this.currentResponse +1 < this.responses.length) {
            this.currentResponse++;
        }
        r.onRequest(pathRequest);
        return r;
    }
}

export class ResponseHandler {


    constructor() {
        this.pathMappings = [];
        this.currentRequest = 0;
    }

    reset() {
        this.pathMappings = [];
        this.currentRequest = 0;
    }

    getMappedPaths() {
        return this.pathMappings.map( pathMapping => {
            return "[" + pathMapping.method + ":"+pathMapping.path + "]";
        }).join(",");
    }
    mapResponse(path, method, status, body, headers) {
        var pathResponse = new PathResponse(path,method,status,body,headers);
        var existing = this.pathMappings.find(pathMapping => {
           return pathMapping.path == pathResponse.path && pathMapping.method == pathResponse.method;
        });

        if(!existing) {
            existing = new PathMapping(pathResponse.path, pathResponse.method);
            this.pathMappings.push(existing);
        }
        existing.addResponse(pathResponse);
    }

    onRequest(path, method, body, headers) {
        var pathRequest = new PathRequest(path,method,this.currentRequest++, body,headers);
        var mapping = this.findMapping(path, method);
        if(mapping) {
            return mapping.getNextResponse(pathRequest);
        } else {
            return null;
        }
    }

    findMapping(path, method) {
        var mapping = this.pathMappings.find((pathMapping)=> {
            return pathMapping.path == path && pathMapping.method == method;
        });
        return mapping;
    }

    findMappings(path) {
        var mappings = this.pathMappings.filter((pathMapping)=> {
            return pathMapping.path == path;
        });
        return mappings;
    }
    getOptionsForPath(path) {
        var mappings = this.findMappings(path,method);
        return mappings.map(m => m.method).join(",");
    }

    getRequestsForMappings(path,method,status) {
        var requests = [];
        var mappings = this.pathMappings.filter(pathMapping => {
            if(path && method) {
                return pathMapping.path == path && pathMapping.method == method;
            } else if(path) {
                return pathMapping.path == path;
            } else {
                return true;
            }
        });
        var responses =[];
        mappings.forEach(pathMapping => {
            responses = responses.concat(pathMapping.responses);
        });
        if(status) {
            responses = responses.filter(response => {
                return response.responseHttpStatus == status;
            });
        }
        responses.forEach(response => {
            requests = requests.concat(response.requests);
        });
        responses.sort((a,b)=>{
            return a.requestIndex - b.requestIndex;
        });

        return requests;

    }

}