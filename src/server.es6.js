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
import {inspect} from './utility.es6.js';
import {OK} from './http-status-codes.es6.js';
import {
	MutalyzerError,
	errorNormalizer,
	errorLogger,
	errorTransmitter,
	doneWithError
} from './errors.es6.js';


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SOAP specific utility function                                                                                     //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function soapOperation(soap, operation, params) {
	/* call the Mutalyzer SOAP server */
	let result = [...Object.values(await soap[operation](params))][0];

	/* 'flatten' the SOAP output */
	for (let [key, value] of Object.entries(result)) {
		if (_.isPlainObject(value)) {
			result[key] = [...Object.values(value)][0];
		}
	}

	/* throw any errors */
	if (result.errors > 0) {
		for (let msg of result.messages) {
			if (msg.errorcode[0] === 'E') {
				throw new MutalyzerError(msg);
			}
		}
	}

	/* return the result */
	return result;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Turtle templates                                                                                                   //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const ttl = {

	runMutalyzer: Handlebars.compile(require('raw!./templates/runMutalyzer._ttl')),

    info: Handlebars.compile(require('raw!./templates/runMutalyzer._ttl')),

    getTranscriptsAndInfo: Handlebars.compile(require('raw!./templates/runMutalyzer._ttl'))

	// <-- insert templates for other API responses here

};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// operations                                                                                                         //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const operations = {

	async runMutalyzer({soap, mimeType, req, res}) {
		/* extract the expected parameters */
		const params = _.pick(req.query, ['variant']);

		/* call the Mutalyzer SOAP server */
		let runMutalyzerResult = await soapOperation(soap, 'runMutalyzer', params);

		/* translate result to Turtle when that mime type was requested */
		if (mimeType === 'text/turtle') {
			runMutalyzerResult = ttl.runMutalyzer(_.cloneDeep(
				{...params, ...runMutalyzerResult},
				(val, key) => {
					/* escaping certain characters */
					if (_.isString(val)) { return val.replace(/\./g, '\\.') }
				}
			));
		}

		/* send the result */
		res.status(OK).set('content-type', mimeType).send(runMutalyzerResult);
	},

    async info({soap, mimeType, req, res}) {
        /* extract the expected parameters */
        const params = {};

        /* call the Mutalyzer SOAP server */
        let infoResult = await soapOperation(soap, 'info', params);

        /* translate result to Turtle when that mime type was requested */
        if (mimeType === 'text/turtle') {
            infoResult = ttl.info(_.cloneDeep(
                {...params, ...infoResult},
                (val, key) => {
                    /* escaping certain characters */
                    if (_.isString(val)) { return val.replace(/\./g, '\\.') }
                }
            ));
        }

        /* send the result */
        res.status(OK).set('content-type', mimeType).send(infoResult);
    },

    async getTranscriptsAndInfo({soap, mimeType, req, res}) {
        /* extract the expected parameters */
        const params = _.pick(req.query, ['genomicReference', 'geneName']);

        /* call the Mutalyzer SOAP server */
        let getTranscriptsAndInfoResult = await soapOperation(soap, 'getTranscriptsAndInfo', params);

        /* translate result to Turtle when that mime type was requested */
        if (mimeType === 'text/turtle') {
            getTranscriptsAndInfoResult = ttl.getTranscriptsAndInfo(_.cloneDeep(
                {...params, ...getTranscriptsAndInfoResult},
                (val, key) => {
                    /* escaping certain characters */
                    if (_.isString(val)) { return val.replace(/\./g, '\\.') }
                }
            ));
        }

        /* send the result */
        res.status(OK).set('content-type', mimeType).send(getTranscriptsAndInfoResult);
    }

	// <-- insert implementations for other API calls here

};


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
					operations[pathObj[method]['x-operation']]({soap, mimeType, req, res}).catch(next);
				} catch (err) {
					next(err);
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
