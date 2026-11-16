import * as migration_20261116_124710_initial from './20261116_124710_initial';

export const migrations = [
  {
    up: migration_20261116_124710_initial.up,
    down: migration_20261116_124710_initial.down,
    name: '20261116_124710_initial'
  },
];
