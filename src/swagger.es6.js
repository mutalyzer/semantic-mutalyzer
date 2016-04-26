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
			'cStart': { type: 'string', required: true },
			'chromStop': { type: 'number' },
			'chromStart': { type: 'number' }
		}
	},
	Message: {
		type: 'object',
		properties: {
			'errorcode': { type: 'string', required: true },
			'message':   { type: 'string' }
		}
	},


    GetTranscriptsAndInfoOutput: {
        type: 'object',
        properties: {
            'transcripts': {
                description: '',
                type: 'array',
                items: { $ref: '#/definitions/TranscriptInfo' }
            }
        }
    },
    TranscriptInfo: {
        type: 'object',
        properties: {
            'linkMethod': { type: 'string', required: true },
            'exons': { type: 'array', items: { $ref: '#/definitions/ExonInfo' } },
            'cCDSStop': { type: 'string', required: true },
            'chromTransStart': { type: 'number' },
            'locusTag': { type: 'string', required: true },
            'chromCDSStart': { type: 'number' },
            'gTransStart': { type: 'number', required: true },
            'id': { type: 'string', required: true },
            'cTransEnd': { type: 'string', required: true },
            'cCDSStart': { type: 'string', required: true },
            'chromTransEnd': { type: 'number' },
            'gTransEnd': { type: 'number', required: true },
            'product': { type: 'string', required: true },
            'proteinTranscript': { type: 'object', $ref: '#/definitions/ProteinTranscript' },
            'sortableTransEnd': { type: 'number', required: true },
            'name': { type: 'string', required: true },
            'chromCDSStop': { type: 'number' },
            'gCDSStop': { type: 'number', required: true },
            'gCDSStart': { type: 'number', required: true },
            'cTransStart': { type: 'string', required: true }
        }
    },
    ProteinTranscript: {
        type: 'object',
        properties: {
            'name': { type: 'string', required: true },
            'product': { type: 'string', required: true },
            'id': { type: 'string', required: true }
        }
    },

    InfoOutput: {
        type: 'object',
        properties: {
            'contactEmail': { type: 'string' },
            'announcement': { type: 'string' },
            'serverName': { type: 'string' },
            'nomenclatureVersion': { type: 'string' },
            'announcementUrl': { type: 'string' },
            'releaseDate': { type: 'string' },
            'version': { type: 'string' },
            'versionParts': { type: 'array', items: { $ref: '#/definitions/VersionPart' } },
            'nomenclatureVersionParts': { type: 'array', items: { $ref: '#/definitions/VersionPart' } },
        }
    },
    VersionPart: {
        type: 'object',
        properties: {
            'string': { type: 'string' }
        }
    }

	// <-- insert other data-type definitions here

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
	},

    '/info': {
        get: {
            summary: "Gives some static application information, such as the current running version.",
            'x-operation': 'info',
            parameters: [
            ],
            responses: {
                200: {
                    description: "A lot of information about mutalyzer",
                    schema: { $ref: '#/definitions/InfoOutput' }
                }
            }
        }
    },

    '/getTranscriptsAndInfo': {
        get: {
            summary: 'Given a genomic reference, return all its transcripts with their transcription/cds start/end sites and exons.',
            'x-operation': 'getTranscriptsAndInfo',
            parameters: [
                {
                    name: 'genomicReference',
                    in: 'query',
                    type: 'string',
                    description: 'Name of a reference sequence',
                    required: true
                },
                {
                    name: 'geneName',
                    in: 'query',
                    type: 'string',
                    description: 'Name of gene to restrict returned transcripts to. Default is to return all transcripts',
                }
            ],
            responses: {
                200: {
                    description: "A lot of information about the given genomic reference",
                    schema: { $ref: '#/definitions/GetTranscriptsAndInfoOutput' }
                }
            }
        }
    }

	// <-- insert other path specifications here

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
	produces: ['text/turtle', 'application/json'], //, 'application/ld+json'
	definitions,
	paths
};
