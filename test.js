const git = require('isomorphic-git');

git.status({ fs, dir: '/', filepath: 'README.md' }).then(console.log, console.error)