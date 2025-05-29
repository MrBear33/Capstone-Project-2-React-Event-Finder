module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest', // Use babel-jest to transform JSX/TSX files
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios)/', // Allow axios ESM build to be transformed
  ],
};
