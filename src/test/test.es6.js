////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// imports                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import MockSoapServer from './mock-soap-server.es6.js';
import getServer      from '../server.es6.js';
import swaggerSpec    from '../swagger.es6.js';

import _               from 'lodash';
import turtleValidator from 'turtle-validator/lib/validator';
import supertest       from 'supertest-as-promised';
import chai            from 'chai';
const {expect} = chai;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// utility functions                                                                                                  //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const validateTurtleCode = (input) => new Promise((resolve, reject) => {
	turtleValidator(input, (feedback) => {
		(feedback.errors.length > 0 ? reject : resolve)(feedback);
	});
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// setup                                                                                                              //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* before all tests: start server, wait for it, get the supertest library rolling */
let api, soapClientStub;
before(async () => {
	let server = await getServer(`${__dirname}/../`, {
		consoleLogging: false,
		soapUrl: 'https://mutalyzer.nl/services/?wsdl'
	});
	api = supertest(Promise)(server);
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// tests                                                                                                              //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe("swagger.json", () => {

	it("is a JSON file available through the server", () => api
		.get('/swagger.json')
		.expect(200)
		.expect('Content-Type', /application\/json/)
		.expect(({body}) => { expect(body).to.deep.equal(swaggerSpec) }));

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe("docs", () => {

	it("is an html page available through the server", () => api
		.get('/docs').redirects(5)
		.expect(200)
		.expect('Content-Type', /text\/html/));

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

beforeEach(() => { MockSoapServer.install() });
afterEach (() => { MockSoapServer.restore() });

describe("/runMutalyzer", () => {

	it("responds with valid JSON output when requested", () => api
		.get('/runMutalyzer')
		.set('Accept', 'application/json')
		.query({ variant: 'AB026906.1:c.3_4insG' })
		.expect(200)
		.expect('Content-Type', /application\/json/)
		.expect(({text}) => { JSON.parse(text) }));

	it("responds with valid turtle output when requested", () => api
		.get('/runMutalyzer')
		.set('Accept', 'text/turtle')
		.query({ variant: 'AB026906.1:c.3_4insG' })
		.expect(200)
		.expect('Content-Type', /text\/turtle/)
		.then(({text}) => validateTurtleCode(text)));

});
