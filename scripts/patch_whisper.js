const fs = require('fs');
const path = require('path');

const whisperDir = path.resolve(__dirname, '../mobile/node_modules/whisper.rn');
if (!fs.existsSync(whisperDir)) {
  console.log('whisper.rn not found, skipping patch.');
  process.exit(0);
}

// 1. Patch package.json
const pkgPath = path.join(whisperDir, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (!pkg.exports) pkg.exports = {};
  if (!pkg.exports['.']) {
    pkg.exports = {
      '.': {
        'react-native': './src/index.ts',
        'types': './lib/typescript/index.d.ts',
        'import': './lib/module/index.js',
        'require': './lib/commonjs/index.js'
      },
      ...pkg.exports
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    console.log('Patched whisper.rn/package.json exports');
  }
}

// 2. Patch NativeRNWhisper.ts
const tsPath = path.join(whisperDir, 'src/NativeRNWhisper.ts');
if (fs.existsSync(tsPath)) {
  let content = fs.readFileSync(tsPath, 'utf8');
  if (!content.includes('NativeModules.RNWhisper')) {
    content = content.replace(
      /export default TurboModuleRegistry\.get<Spec>\('RNWhisper'\) as Spec/,
      "export default (TurboModuleRegistry.get<Spec>('RNWhisper') || require('react-native').NativeModules.RNWhisper) as Spec"
    );
    fs.writeFileSync(tsPath, content, 'utf8');
    console.log('Patched NativeRNWhisper.ts');
  }
}

// 3. Patch lib/commonjs/NativeRNWhisper.js
const cjsPath = path.join(whisperDir, 'lib/commonjs/NativeRNWhisper.js');
if (fs.existsSync(cjsPath)) {
  let content = fs.readFileSync(cjsPath, 'utf8');
  if (!content.includes('NativeModules.RNWhisper')) {
    content = content.replace(
      "var _default = _reactNative.TurboModuleRegistry.get('RNWhisper');",
      "var _default = _reactNative.TurboModuleRegistry.get('RNWhisper') || _reactNative.NativeModules.RNWhisper;"
    );
    fs.writeFileSync(cjsPath, content, 'utf8');
    console.log('Patched lib/commonjs/NativeRNWhisper.js');
  }
}

// 4. Patch lib/module/NativeRNWhisper.js
const esmPath = path.join(whisperDir, 'lib/module/NativeRNWhisper.js');
if (fs.existsSync(esmPath)) {
  let content = fs.readFileSync(esmPath, 'utf8');
  if (!content.includes('NativeModules.RNWhisper')) {
    content = content.replace(
      "var _default = TurboModuleRegistry.get('RNWhisper');",
      "var _default = TurboModuleRegistry.get('RNWhisper') || NativeModules.RNWhisper;"
    );
    fs.writeFileSync(esmPath, content, 'utf8');
    console.log('Patched lib/module/NativeRNWhisper.js');
  }
}
console.log('whisper.rn verification & patching complete.');
