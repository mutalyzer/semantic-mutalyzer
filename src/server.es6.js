////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// imports                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* external libs */
import _       from 'lodash';
import co      from 'co';
import express from 'express';
import soap    from 'soap-as-promised';

/* local stuff */
import {debugPromise} from './utility.es6.js';
import {
	OK,
	CREATED,
	NO_CONTENT,
	BAD_REQUEST,
	NOT_FOUND,
	CONFLICT,
	GONE,
	PRECONDITION_FAILED,
	INTERNAL_SERVER_ERROR
} from './http-status-codes.es6.js';


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// main server code                                                                                                   //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

co(function* () {
	try {
		console.log('(1)');

		let client = yield soap.createClient('https://mutalyzer.nl/services/?wsdl');

		console.log('(2)');

		let result = yield client.runMutalyzer({ variant: `AB026906.1:c.274G>T` });

		console.log('(3)', result);
	} catch (err) {
		console.log('(E)', err);
	}
});

