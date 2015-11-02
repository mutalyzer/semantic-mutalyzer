import _ from 'lodash';

import SuperTest from 'supertest';

Object.assign(SuperTest.Test.prototype, {
	expectArrayWith(fields, cb) {
		return this.expect((res) => {
			if (!Object.keys(fields).every((key) => res.body[0][key] === fields[key])) {
				let error = new Error("Expected response body to have different field values.");
				error.actual   = _.pick(res.body[0], Object.keys(fields));
				error.expected = fields;
				throw error;
			}
		}, cb);
	},
	resources(cb) {
		return this.expect(({body}) => cb(body));
	},
	resource(cb) {
		return this.resources(([resource]) => cb(resource));
	}
});

export default require('supertest-as-promised');
