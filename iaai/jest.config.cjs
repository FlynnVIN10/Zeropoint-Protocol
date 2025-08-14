module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'test/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  },
  collectCoverageFrom: [
    '**/*.(t|j)s'
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.\\./.*)\\.js$': '$1',
    '^(\\./.*)\\.js$': '$1',
    '^helia$': '<rootDir>/test/__mocks__/helia.cjs',
    '^@helia/unixfs$': '<rootDir>/test/__mocks__/helia-unixfs.cjs',
    '^multiformats/cid$': '<rootDir>/test/__mocks__/multiformats-cid.cjs'
  }
}; 