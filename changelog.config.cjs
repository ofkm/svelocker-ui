'use strict';

module.exports = {
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
    // Add chore type to be included in changelog
    { type: 'chore', section: 'Chores' }
  ],
  
  // Override the default breaking change prefix to make it more noticeable
  noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
  
  // Define commit URL format for your repository
  commitUrlFormat: 'https://github.com/kmendell/svelocker-ui/commit/{{hash}}',
  
  // Define issue URL format for your repository
  issueUrlFormat: 'https://github.com/kmendell/svelocker-ui/issues/{{id}}',
  
  // Include commit messages with scope
  includeScope: true,
  
  // Don't include content from merge commits
  ignoreReverted: true,
  
  // Sort sections alphabetically
  sortBy: 'title'
};
