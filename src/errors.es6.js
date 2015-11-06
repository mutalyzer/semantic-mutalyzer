////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// imports                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {
	BAD_REQUEST,
	INTERNAL_SERVER_ERROR
} from './http-status-codes.es6.js';


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// error-related classes                                                                                              //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* Error subtype based on Mutalyzer output */
export class MutalyzerError extends Error {
	constructor({errorcode, message}) {
		super(message);
		this.message = message;
		this.status = BAD_REQUEST;
		this.code = errorcode;
	}
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// error-related middleware                                                                                           //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* error normalizer */
export function errorNormalizer(err, req, res, next) {

	/* Mutalyzer errors */
	if (err instanceof MutalyzerError) {
		return next(err);
	}

	/* swagger errors */
	if (err.message && err.message.match(/^\d\d\d Error:/)) {
		let messages = [];
		let properties = {};
		for (let msgPart of err.message.split('\n')) {
			let match = msgPart.match(/\d\d\d Error: (.*)/);
			if (match) {
				messages.push(match[1]);
				continue;
			}
			match = msgPart.match(/(.*?): \s*"?([^"]*)"?\s*/);
			if (match) {
				properties[match[1]] = match[2];
				continue;
			}
		}
		return next({
			info: properties,
			status: err.status,
			message: messages.map(msg => msg.replace(/"([\w\d\-_\s]+?)"/g, "'$1'")).join(' ')
			//       ^ we like single-quoted strings
		});
	}

	/* any other errors */
	return next({
		status: INTERNAL_SERVER_ERROR,
		message: "An error occurred on the server that we did not expect. Please let us know!",
		originalError: err
	});

}

/* error logging */
export function errorLogger(err, req, res, next) {
	console.error(JSON.stringify(err, null, 4));
	return next(err);
}

/* error transmission */
export function errorTransmitter(err, req, res, next) {
	res.status(err.status).send(err);
	return next(err);
}

/* done with error */
export function doneWithError(err, req, res, next) {}
