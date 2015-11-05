////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// imports                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import config from './config.es6.js';


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// definitions                                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const definitions = {
	RunMutalyzerOutput: {
		type: 'object',
		properties: {
			'referenceId': {
				description: "Identifier of the reference sequence used",
				type: 'string',
				required: true
			},
			'sourceId': {
				description: "Identifier of the reference sequence source, e.g. the chromosomal accession number and version in case referenceId is a  UD reference created as a chromosomal slice",
				type: 'string',
				required: true
			},
			'sourceAccession': {
				description: "Accession number of the reference sequence source (only for genbank references)",
				type: 'string'
			},
			'sourceVersion': {
				description: "Version number of the reference sequence source (only for genbank references)",
				type: 'string'
			},
			'sourceGi': {
				description: "GI number of the reference sequence source (only for genbank references)",
				type: 'string'
			},
			'molecule': {
				description: "Molecular type of the reference sequence",
				type: 'string',
				enum: ['c', 'g', 'm', 'n', 'r', 'p'],
				'x-enumNames': [
					"Coding DNA reference sequence",
					"Genomic reference sequence",
					"Mitochondrial reference sequence",
					"Non-coding RNA reference sequence (gene producing an RNA transcript but not a protein)",
					"RNA reference sequence",
					"Protein reference sequence"
				],
				required: true
			},
			'original': {
				description: "Original sequence",
				type: 'string',
				required: true
			},
			'mutated': {
				description: "Mutated sequence",
				type: 'string',
				required: true
			},
			'origMRNA': {
				description: "Original transcript sequence",
				type: 'string',
				required: true
			},
			'mutatedMRNA': {
				description: "Mutated transcript sequence",
				type: 'string',
				required: true
			},
			'origCDS': {
				description: "Original CDS",
				type: 'string',
				required: true
			},
			'newCDS': {
				description: "Mutated CDS",
				type: 'string',
				required: true
			},
			'origProtein': {
				description: "Original protein sequence",
				type: 'string',
				required: true
			},
			'newProtein': {
				description: "Mutated protein sequence",
				type: 'string',
				required: true
			},
			'altProtein': {
				description: "Alternative mutated protein sequence",
				type: 'string',
				required: true
			},
			'errors': {
				description: "Number of errors",
				type: 'number',
				required: true
			},
			'warnings': {
				description: "Number of warnings",
				type: 'number',
				required: true
			},
			'summary': {
				description: "Summary of messages",
				type: 'string',
				required: true
			},
			'chromDescription': {
				description: "Chromosomal description",
				type: 'string',
				required: true
			},
			'genomicDescription': {
				description: "Genomic description",
				type: 'string',
				required: true
			},
			'transcriptDescriptions': {
				description: "List of transcript descriptions",
				type: 'array',
				items: { type: 'string' },
				required: true
			},
			'proteinDescriptions': {
				description: "List of protein descriptions",
				type: 'array',
				items: { type: 'string' },
				required: true
			},
			'rawVariants': {
				description: "List of raw variants",
				type: 'array',
				items: { $ref: '#/definitions/RawVariant' },
				required: true
			},
			'exons': {
				description: "If a transcript is selected, array of ExonInfo objects for each exon in the selected transcript",
				type: 'array',
				items: { $ref: '#/definitions/ExonInfo' }
			},
			'messages': {
				description: "List of (error) messages",
				type: 'array',
				items: { $ref: '#/definitions/Message' }
			}
		}
	},
	RawVariant: {
		type: 'object',
		properties: {
			'description':   { type: 'string', required: true, description: "Description of the raw variant"         },
			'visualisation': { type: 'string', required: true, description: "ASCII visualisation of the raw variant" }
		}
	},
	ExonInfo: {
		type: 'object',
		properties: {
			'gStop':  { type: 'number', required: true },
			'gStart': { type: 'number', required: true },
			'cStop':  { type: 'string', required: true },
			'cStart': { type: 'string', required: true }
		}
	},
	Message: {
		type: 'object',
		properties: {
			'errorcode': { type: 'string', required: true },
			'message':   { type: 'string' }
		}
	}
};

/* set proper 'required' schema properties */
for (let typeSchema of Object.values(definitions)) {
	let required = [];
	for (let [propName, propSchema] of Object.entries(typeSchema.properties || {})) {
		if (propSchema.required) {
			delete propSchema.required;
			required.push(propName);
		}
	}
	typeSchema.required = required;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// paths                                                                                                              //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const paths = {
	'/runMutalyzer': {
		get: {
			summary: "run the Mutalyzer name checker",
			'x-operation': 'runMutalyzer',
			parameters: [
				{
					name:        'variant',
					in:          'query',
					type:        'string',
					description: "The variant description to check",
					required: true
				}
			],
			responses: {
				200: {
					description: "A lot of information about the given variant",
					schema: { $ref: '#/definitions/RunMutalyzerOutput' }
				}
			}
		}
	}
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// final Swagger spec                                                                                                 //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default {
	swagger: '2.0',
	info: {
		title:   "Semantic Mutalyzer",
		version: '1'
	},
	host: `${config.host}:${config.port}`,
	consumes: ['application/json', 'text/turtle'], //, 'application/ld+json'
	produces: ['application/json', 'text/turtle'], //, 'application/ld+json'
	definitions,
	paths
};
