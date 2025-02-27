import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

(async () => {
	try {
		console.log('Checking Docker...');
		const dockerResult = await execPromise('docker info');
		console.log('Docker is available');

		console.log('Checking Docker Compose...');
		const composeResult = await execPromise('docker-compose -v');
		console.log('Docker Compose is available');

		console.log('Checking docker-compose.test.yml file...');
		const fileCheck = await execPromise('ls -la tests/e2e/docker-compose.test.yml');
		console.log('File exists:', fileCheck.stdout.trim());

		console.log('All prerequisites satisfied!');
		process.exit(0);
	} catch (error) {
		console.error('ERROR:', error.message);
		process.exit(1);
	}
})();
