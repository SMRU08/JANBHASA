const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    assetExts: [...assetExts, 'bin', 'onnx', 'ttf'],
    sourceExts: [...sourceExts, 'ts', 'tsx'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
