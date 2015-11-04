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
				type: 'string'
			},
			'sourceId': {
				description: "Identifier of the reference sequence source, e.g. the chromosomal accession number and version in case referenceId is a  UD reference created as a chromosomal slice",
				type: 'string'
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
				]
			},
			'original': {
				description: "Original sequence",
				type: 'string'
			},
			'mutated': {
				description: "Mutated sequence",
				type: 'string'
			},
			'origMRNA': {
				description: "Original transcript sequence",
				type: 'string'
			},
			'mutatedMRNA': {
				description: "Mutated transcript sequence",
				type: 'string'
			},
			'origCDS': {
				description: "Original CDS",
				type: 'string'
			},
			'newCDS': {
				description: "Mutated CDS",
				type: 'string'
			},
			'origProtein': {
				description: "Original protein sequence",
				type: 'string'
			},
			'newProtein': {
				description: "Mutated protein sequence",
				type: 'string'
			},
			'altProtein': {
				description: "Alternative mutated protein sequence",
				type: 'string'
			},
			'errors': {
				description: "Number of errors",
				type: 'number'
			},
			'warnings': {
				description: "Number of warnings",
				type: 'number'
			},
			'summary': {
				description: "Summary of messages",
				type: 'string'
			},
			'chromDescription': {
				description: "Chromosomal description",
				type: 'string'
			},
			'genomicDescription': {
				description: "Genomic description",
				type: 'string'
			},
			'transcriptDescriptions': {
				description: "List of transcript descriptions",
				type: 'array',
				items: { type: 'string' }
			},
			'proteinDescriptions': {
				description: "List of protein descriptions",
				type: 'array',
				items: { type: 'string' }
			},
			'rawVariants': {
				description: "List of raw variants",
				type: 'array',
				items: {
					type: 'object',
					properties: {
						'description':   { type: 'string', description: "Description of the raw variant"         },
						'visualisation': { type: 'string', description: "ASCII visualisation of the raw variant" }
					}
				}
			},
			'exons': {
				description: "If a transcript is selected, array of ExonInfo objects for each exon in the selected transcript",
				type: 'array',
				items: {
					type: 'object',
					properties: {
						'gStop':  { type: 'number' },
						'gStart': { type: 'number' },
						'cStop':  { type: 'string' },
						'cStart': { type: 'string' }
					}
				}
			},
			'messages': {
				description: "List of (error) messages",
				type: 'array',
				items: {
					type: 'object',
					properties: {
						'errorcode': { type: 'string' },
						'message':   { type: 'string' }
					}
				}
			}
		}
	}
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// paths                                                                                                              //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const paths = {
	'/runMutalyzer': {
		post: {
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
					schema: { $ref: 'RunMutalyzerOutput' }
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
	consumes: ['application/json', 'application/ld+json', 'text/turtle'],
	produces: ['application/json', 'application/ld+json', 'text/turtle'],
	definitions,
	paths
};
