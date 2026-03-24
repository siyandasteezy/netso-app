const { getDefaultConfig } = require("expo/metro-config");
const { mergeConfig } = require("metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Block packages that use import.meta and should never be in the app bundle
const blockList = [
  /@react-native\/debugger-frontend/,
  /acorn\/dist\/acorn\.mjs/,
];

const mergedConfig = mergeConfig(config, {
  resolver: {
    // Use CJS resolution — avoids ESM files that use import.meta
    unstable_enablePackageExports: false,
    blockList: blockList,
  },
  transformer: {
    unstable_allowRequireContext: true,
  },
});

module.exports = mergedConfig;
