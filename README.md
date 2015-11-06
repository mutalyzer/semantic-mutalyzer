# Semantic Mutalyzer

[Mutalyzer](https://mutalyzer.nl) is a suite of programs, and
specifically a [web service](https://mutalyzer.nl/webservices),
to support checks of sequence variant nomenclature according to
the [guidelines](http://www.hgvs.org/mutnomen)
of the [Human Genome Variation Society](http://www.hgvs.org).

Semantic Mutalyzer (organized in this repository) takes the Mutalyzer
web service and reorganizes the output using [RDF](https://en.wikipedia.org/wiki/Resource_Description_Framework)
to conform to [semantic web](https://en.wikipedia.org/wiki/Semantic_Web) standards.
It is written as a [Node.js](https://nodejs.org) script.


## How to Install

This package is not (yet) available on NPM or other package managers.
To install it, run the following commands:

```
git clone https://github.com/mhelvens/semantic-mutalyzer.git
cd <directory>
npm install
npm run build
```

## How to Use

First, you can edit `config.json` to change the `host` and `port` under which
the new service will be available. The `soap-url` value refers to the
WSDL description of the original Mutalyzer web service, and should probably
keep the value it has.

Then the server can be started, stopped and restarted as a daemon by running:

```
npm start
npm restart
npm stop
```

Alternatively, you can also run the server in the foreground by running:

```
node dist/server/server.js
```

This version also accepts certain command line parameters that can overwrite
values from `config.json`:

```
node dist/server/server.js --help
```

When the server is running (assuming default values in `config.json`)
you can open `http://localhost:8888/docs` in the browser to read
the automatically generated API documentation. You can also use that
page to try out the API right there.

There will also be a [Swagger](http://swagger.io/) description of the API
available at `http://localhost:8888/swagger.json`, which can be used by
various Swagger-aware clients.


## Development

As of this writing, the Semantic Mutalyzer service is quite unfinished.
Here follows some information about the structure of the project and the code
to allow any who read it to continue development.

All code for this server (in the `/src` directory) written in [ECMAScript 6](http://es6-features.org)
(with some features from ECMAScript 7).
[Babel](https://babeljs.io/) is used to transpile it to ECMAScript 5
(the version of Javascript supported by Node.js).

Most of the build process is managed with [Webpack](https://webpack.github.io)
(see `webpack.config.js`),
but the top-level build-commands (which you should use) are
[npm](https://www.npmjs.com/) scripts (see `package.json`):

```
npm run build-docs    #
npm run build-server  #
npm run build         # combines the other two build scripts
```


### Directory Structure

The structure of the root directory of this project pretty much follows
the conventions of the average [npm](https://www.npmjs.com/) / [Webpack](https://webpack.github.io/) project.
Almost all development happens in the `/src` directory, so it is worth
going over the directories and files inside it:

File / Directory                 |  Meaning
---------------------------------|----------------------------
`/src/docs`                      |  slightly modified version of [swagger-ui](https://www.npmjs.com/package/swagger-ui) to generate the API documentation
`/src/images`                    |  all images (like `favicon.ico`)
`/src/server`                    |  the main Node script(s) for the server
`/src/templates`                 |  some [Handlebar](http://handlebarsjs.com/) templates for generating [Turtle](http://www.w3.org/TR/turtle/) RDF output
`/src/test`                      |  all unit-test related code
`/src/tools`                     |  local tools used in the build process
`/src/config.es6.js`             |  module that gathers configuration options
`/src/http-status-codes.es6.js`  |  intuitive names for the HTTP status codes
`/src/server.es6.js`             |  module that does most of the work and exports an [Express](http://expressjs.com) app
`/src/swagger.es6.js`            |  module that builds and exports the Swagger specification as a Javascript object
`/src/utility.es6.js`            |  miscellaneous utility functions


### The Source Code

As stated before, the source code is mostly ES6. It also uses one feature from ES7,
namely [`async`/`await`](http://www.sitepoint.com/simplifying-asynchronous-coding-es7-async-functions/),
which are an intuitive and powerful way to write asynchronous code that uses
[promises](http://es6-features.org/#PromiseUsage) in the background.

Furthermore, the code sometimes explicitly uses [Webpack loaders](https://webpack.github.io/docs/using-loaders.html),
which can pre-process imported files during the build process. For example:

```
require('raw!./templates/runMutalyzer._ttl')
require('file!./images/favicon.ico')
```

So as it is, the source-code *expects to be processed with Webpack*.


### Testing

A unit-test is set up in the `/src/test` directory to test the server.
You should run the tests after making any changes:

```
npm test
```

This command launches the [Mocha](https://mochajs.org) test-runner.
The tests are listed in `/src/test/test.es6.js`, and new tests should be
added there to cover any new functionality introduced.

Two main libraries are used to help in writing tests. First, the
[supertest](https://www.npmjs.com/package/supertest) library can be used
to succinctly formulate expectations about server calls. Inside tests,
this functionality can be accessed through the `api` variable.
For example:

```
it("responds with valid JSON output when requested", () => api
    .get('/runMutalyzer')
    .set('Accept', 'application/json')
    .query({ variant: 'AB026906.1:c.3_4insG' })
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .expect(({text}) => { JSON.parse(text) }));
```

Second, the Mutalyzer server is not actually queried for testing purposes,
as this would require an active internet connection, would put unnecessary
load on their server, and would make the tests quite slow.
Instead, the Mutalyzer server is *mocked* using
the [nock](https://www.npmjs.com/package/nock) library.
This functionality is implemented in `/src/test/mock-soap-server.es6.js`,
and this is where cached responses are located (and new ones can be added).


### How to add a new API operation

As of this writing, only the `runMutalyzer` operation is supported
(and that only partially). To add a new server operation, the
following things should be done:

1. In `/src/swagger.es6.js`, add a specification of the new operation in the `paths` object.
   If necessary, add related data-type specifications in `definitions`.
2. In `/src/server.es6.js`, add the implementation of the new operation to the
   `operations` object. If necessary, add a new [Turtle](http://www.w3.org/TR/turtle/)
   response template to the `ttl` object.
   You can add a file to `/src/templates` to help with this,
   using [Handlebar](http://handlebarsjs.com) template syntax.
3. Write a set of tests for the new operation in `/src/test/test.es6.js`.
   To accommodate these tests, add some cached responses to `/src/test/mock-soap-server.es6.js`.
   To get the proper data for these cached responses, you can temporarily enable all
   network traffic and nock-recording in that same file: comment in/out the relevant lines
   of code at the top of that file.

### How to augment semantic connections in existing RDF responses

The files in `/src/templates` contain all RDF for `text/turtle` server responses.
This is where new triples can be added, and you can use [Handlebar](http://handlebarsjs.com)-based
placeholders for values contained in the `application/json` server response, e.g., `{{{referenceId}}}`.
If necessary, additional data can be prepared in the corresponding function in the `operations` object
of `/src/server.es6.js`, that may then be recalled in the template.
