const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  transformer: {
    assetRegistryPath: 'react-native/Libraries/Image/AssetRegistry',
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    extraNodeModules: {
      'react-native/asset-registry': path.resolve(__dirname, 'node_modules/react-native/Libraries/Image/AssetRegistry.js'),
    },
    assetExts: [...assetExts, 'bin', 'onnx', 'ttf'],
    sourceExts: [...sourceExts, 'ts', 'tsx'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
