import commander from 'commander';
import fs        from 'fs';
import _         from 'lodash';

function findConfig(filename) {
	for (let path = fs.realpathSync('.'); path !== '/'; path = fs.realpathSync(path + '/../')) {
		try {
			if (fs.statSync(path + '/config.json').isFile()) {
				return JSON.parse(fs.readFileSync(`${path}/${filename}`, { encoding: 'utf-8' }));
			}
		} catch (e) {}
	}
	return {};
}

commander
	.option('-c, --config [file]', "a JSON configuration file", 'config.json')
	.parse(_.without(process.argv, 'help', '--help', 'h')); // do not trigger help yet at this stage

let config = findConfig(commander.config);

commander
	.option('-h, --host [host]',     "the host through which this server is exposed",  config['host'] || 'localhost' )
	.option('-p, --port [port]',     "the port to listen to",     a=>parseInt(a, 10),  config['port'] ||  8888       )
	.option('-s, --soap-url [url]',  "the wsdl endpoint of the Mutalyzer SOAP API",    config['soap-url']            )
	.parse(process.argv);

export default commander;
