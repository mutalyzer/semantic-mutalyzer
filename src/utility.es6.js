////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// imports                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* external libs */
import _    from 'lodash';
import util from 'util';


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// very general stuff                                                                                                 //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const debugPromise = (marker) => [
	(data) => { console.log  (`(${marker}) RESOLVED:`, JSON.stringify(data)); return data; },
	(data) => { console.error(`(${marker}) REJECTED:`, JSON.stringify(data)); throw  data; }
];

export function toCamelCase(str) {
	return str
			.replace(/\s(.)/g, l => l.toUpperCase())
			.replace(/\s/g,    ''                  )
			.replace(/^(.)/,   l => l.toLowerCase());
}

export function def(object, field, defaultValue) {
	if (typeof object[field] === 'undefined') {
		object[field] = defaultValue;
	}
	return object[field];
}

export const a = (object, field) => def(object, field, []);
export const o = (object, field) => def(object, field, {});

export const simpleSpaced = (str) => str.replace(/\s+/mg, ' ');

export const humanMsg = (strings, ...values) => {
	let result = strings[0];
	for (let [val, str] of _.zip(values, strings.slice(1))) {
		result += val + simpleSpaced(str);
	}
	return _.trim(result);
};

export const inspect = (obj, options = {}) => {
	console.log(util.inspect(obj, Object.assign({
		colors: true,
		depth:  2
	}, options)));
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// extending some core prototypes for convenience                                                                     //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if (!_.isFunction(Error.prototype.toJSON)) {
	Object.defineProperty(Error.prototype, 'toJSON', {
		value: function () {
			var alt = {};
			Object.getOwnPropertyNames(this).forEach(function (key) {
				alt[key] = this[key];
			}, this);
			return alt;
		},
		configurable: true
	});
}

if (!_.isFunction(Object.entries)) {
	Object.defineProperty(Object, 'entries', {
		*value(obj) {
			for (let key of Object.keys(obj)) {
				yield [key, obj[key]];
			}
		}
	});
}

if (!_.isFunction(Object.values)) {
	Object.defineProperty(Object, 'values', {
		*value(obj) {
			for (let key of Object.keys(obj)) {
				yield obj[key];
			}
		}
	});
}


