module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  moduleFileExtensions: ['mjs', 'js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: { module: 'CommonJS' } }],
    '^.+\\.mjs$': ['ts-jest', { tsconfig: { module: 'CommonJS', allowJs: true } }],
  },
  // Allow Jest to transform Angular / RxJS / PrimeNG ESM packages
  transformIgnorePatterns: ['node_modules/(?!(@angular|rxjs|primeng)/)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
