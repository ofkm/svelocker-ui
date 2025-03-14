'use strict';

module.exports = {
	options: {
		types: [
			{ type: 'feat', section: 'Features' },
			{ type: 'fix', section: 'Bug Fixes' },
			{ type: 'perf', section: 'Performance Improvements' },
			{ type: 'revert', section: 'Reverts' },
			{ type: 'docs', section: 'Documentation' },
			{ type: 'style', section: 'Styles' },
			{ type: 'refactor', section: 'Code Refactoring' },
			{ type: 'test', section: 'Tests' },
			{ type: 'build', section: 'Build System' },
			{ type: 'ci', section: 'Continuous Integration' },
			// Include chores in the changelog
			{ type: 'chore', section: 'Chores' }
		]
	}
};
