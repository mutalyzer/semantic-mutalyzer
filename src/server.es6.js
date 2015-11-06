////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// imports                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* external libs */
import _          from 'lodash';
import express    from 'express';
import favicon    from 'serve-favicon';
import Soap       from 'soap-as-promised';
import Handlebars from 'handlebars';
import promisify  from 'es6-promisify';
const swaggerMiddleware = promisify(require('swagger-express-middleware'));

/* local stuff */
import {debugPromise, inspect} from './utility.es6.js';
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
// setting up templates                                                                                               //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const ttl = {
	runMutalyzer: Handlebars.compile(require('raw!./templates/runMutalyzer._ttl'))
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// operations                                                                                                         //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let operations = {
	async runMutalyzer({soap, mimeType, req, res}) {

		/* extract the expected parameters */
		const params = _.pick(req.query, ['variant']);

		/* call the Mutalyzer SOAP server */
		let {runMutalyzerResult} = await soap.runMutalyzer(params);

		/* 'flatten' the SOAP output */
		for (let [key, value] of Object.entries(runMutalyzerResult)) {
			if (_.isPlainObject(value)) {
				runMutalyzerResult[key] = [...Object.values(value)][0];
			}
		}

		/* throw any errors */
		if (runMutalyzerResult.errors > 0) {
			for (let msg of runMutalyzerResult.messages) {
				if (msg.errorcode[0] === 'E') {
					throw new MutalyzerError(msg);
				}
			}
		}

		/* handle alternative requested output mime-types */
		if (mimeType === 'text/turtle') {
			runMutalyzerResult = ttl.runMutalyzer(_.cloneDeep(
				{...params, ...runMutalyzerResult},
				(val, key) => {
					if (_.isString(val)) {
						return val.replace(/\./g, '\\.')
					}
				}
			));
		}

		/* send the result */
		res.status(OK).send(runMutalyzerResult);

	}
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// error-related custom middleware                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* errors from Mutalyzer output */
class MutalyzerError extends Error {
	constructor({errorcode, message}) {
		super(message);
		this.message = message;
		this.status = BAD_REQUEST;
		this.code = errorcode;
	}
}

/* error normalizer */
function errorNormalizer(err, req, res, next) {

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
function errorLogger(err, req, res, next) {
	console.error(JSON.stringify(err, null, 4));
	return next(err);
}

/* error transmission */
function errorTransmitter(err, req, res, next) {
	res.status(err.status).send(err);
	return next(err);
}

/* done with error */
function doneWithError(err, req, res, next) {
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// the server                                                                                                         //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default async (distDir, {soapUrl, consoleLogging}) => {

	/* the express application */
	let server = express();

	/* setting up the soap client */
	let soap = await Soap.createClient(soapUrl);

	/* load the middleware */
	let [middleware, swagger] = await swaggerMiddleware(`${distDir}/swagger.json`, server);

	/* serve swagger-ui based documentation */
	server.use(favicon('dist/' + require('file!./images/favicon.ico')));
	server.use('/docs', express.static(`${distDir}/docs/`));

	/* use Swagger middleware */
	server.use(
		middleware.files({apiPath: false, rawFilesPath: '/'}),
		middleware.metadata(),
		middleware.parseRequest(),
		middleware.validateRequest()
	);

	/* request handling */
	for (let path of Object.keys(swagger.paths)) {
		let pathObj = swagger.paths[path];
		let expressStylePath = path.replace(/{(\w+)}/g, ':$1');
		for (let method of Object.keys(pathObj).filter(p => !/x-/.test(p))) {
			server[method](expressStylePath, (req, res, next) => {
				let mimeType = req.accepts(swagger.produces);
				try {
					operations[pathObj[method]['x-operation']]({soap, mimeType, req, res}).catch(next)
				}
				catch (err) {
					next(err)
				}
			});
		}
	}

	/* handling error messages */
	server.use(errorNormalizer);
	if (consoleLogging !== false) {
		server.use(errorLogger)
	}
	server.use(errorTransmitter);
	server.use(doneWithError);

	/* return the server app */
	return server;

};
