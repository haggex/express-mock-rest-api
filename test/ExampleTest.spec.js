import {MockServerApi} from "mock-response-handler";
import * as axios from "axios";
import {expect} from "chai";


/**
 * To be able to use the utils provided in the mock-response-handler we need to create an HttpHandler
 * The HttpHandler need to implement two methods: doGet(url,headers) & doPost(url,entity,headers)
 * In this example I'm using axios http library
 */
class ExampleHttpClient {
    /**
     *
     * @param url - full url to the rest endpoint
     * @param headers
     * @returns {Promise} promise resolving the json from the response
     */
    doGet(url,headers) {
        return this._toJSON(axios.get(url,headers ? { headers : headers } : null))
    }

    /**
     *
     * @param url
     * @param entity
     * @param headers
     * @returns {*}
     */
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


/**
 * Sample service, what you eventually will test in your real code
 */
class SampleService {
    fetchUsers() {
        return new Promise((resolve,reject)=>{
            axios.get("http://localhost:8999/mock-api/users").then( response => {
               resolve(response.data);
            }).catch( err => {
                reject(err);
            });
        })
    }
}

/**
 * Mocha test using chai
 */
describe("Sample test using express mock rest api",()=>{

    var testCall;

    var mockServerApi;
    var sampleService = new SampleService();
    beforeEach(()=>{
        mockServerApi = new MockServerApi(new ExampleHttpClient(), "http://localhost:8999","/responses", "/mock-api");
        var mockResponse = mockServerApi.mockApiRequest();

        //the response I want from my mocked rest api
        var mockedResponse = [
            { username : "Pete"},
            { username : "Fred "}
        ];

        //tell the mock server to return the mocked response for the path /users
        return mockResponse.path("/users")
            .status(200)
            .method("GET")
            .body(mockedResponse)
            .execute();

    });
    afterEach(()=>{
        //reset the mock server
        return mockServerApi.reset();
    });

    it("Test sampele request to mocked endpoint", ()=>{
        return sampleService.fetchUsers().then( users => {
            expect(users.length).to.equal(2);
            expect(users[0].username).to.equal("Pete");
        });
    });

});