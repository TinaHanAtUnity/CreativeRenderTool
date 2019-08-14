module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleDirectories: [
    'node_modules',
    'src/ts',
    'src'
  ],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.(html|xml)?$": "html-loader-jest",
  },
};
