////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// imports                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* external libs */
import _                 from 'lodash';
import co                from 'co';
import express           from 'express';
import Soap              from 'soap-as-promised';
import promisify         from 'es6-promisify';
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
// operations                                                                                                         //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let operations = {
	*runMutalyzer({soap, req, res}) {
		let {runMutalyzerResult} = yield soap.runMutalyzer({ variant: req.query.variant });
		res.status(OK).send(runMutalyzerResult);
	}
};

/* wrapping the functions above with co.wrap */
for (let [name, fn] of Object.entries(operations)) {
	operations[name] = co.wrap(fn);
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// error-related custom middleware                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* error normalizer */
function errorNormalizer(err, req, res, next) {

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
			info:    properties,
			status:  err.status,
			message: messages.map(msg => msg.replace(/"([\w\d\-_\s]+?)"/g, "'$1'")).join(' ')
			//       ^ we like single-quoted strings
		});
	}

	/* any other errors */
	return next({
		status:        INTERNAL_SERVER_ERROR,
		message:       "An error occurred on the server that we did not expect. Please let us know!",
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
function doneWithError(err, req, res, next) {}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// the server                                                                                                         //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default co.wrap(function* (distDir, {soapUrl, consoleLogging}) {

	/* the express application */
	let server = express();



	//console.log('(1)');



	/* setting up the soap client */
	let soap = yield Soap.createClient(soapUrl);



	//console.log('(2)');



	/* load the middleware */
	let [middleware, swagger] = yield swaggerMiddleware(`${distDir}/swagger.json`, server);



	//console.log('(3)');



	/* serve swagger-ui based documentation */
	server.use('/docs', express.static(`${distDir}/docs/`));



	//console.log('(4)');


	//inspect(middleware);


	/* use Swagger middleware */
	server.use(
		middleware.files({ apiPath: false, rawFilesPath: '/' }),
		middleware.metadata(),
		middleware.parseRequest(),
		middleware.validateRequest()
	);



	//console.log('(5)');



	/* request handling */
	for (let path of Object.keys(swagger.paths)) {
		let pathObj          = swagger.paths[path];
		let expressStylePath = path.replace(/{(\w+)}/g, ':$1');
		for (let method of Object.keys(pathObj).filter(p => !/x-/.test(p))) {
			server[method](expressStylePath, (req, res, next) => {
				try { operations[pathObj[method]['x-operation']]({soap, req, res}).catch(next) }
				catch (err) { next(err) }
			});
		}
	}



	//console.log('(6)');



	/* handling error messages */
	server.use(errorNormalizer);
	if (consoleLogging !== false) { server.use(errorLogger) }
	server.use(errorTransmitter);
	server.use(doneWithError);



	//console.log('(7)');



	/* return the server app */
	return server;

});
