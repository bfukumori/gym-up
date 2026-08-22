const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');
const fs = require('node:fs');

const projectRoot = __dirname;
const pnpmRoot = path.resolve(projectRoot, 'node_modules/.pnpm');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [projectRoot, pnpmRoot];

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'expo-router/entry' ||
    moduleName === './node_modules/expo-router/entry' ||
    moduleName === 'expo-router/entry.js'
  ) {
    const real = fs.realpathSync(path.resolve(projectRoot, 'node_modules/expo-router/entry.js'));
    return {
      filePath: real,
      type: 'sourceFile',
    };
  }
  if (
    moduleName === 'expo-router/entry-classic' ||
    moduleName === './node_modules/expo-router/entry-classic' ||
    moduleName === 'expo-router/entry-classic.js'
  ) {
    const real = fs.realpathSync(
      path.resolve(projectRoot, 'node_modules/expo-router/entry-classic.js')
    );
    return {
      filePath: real,
      type: 'sourceFile',
    };
  }
  if (moduleName === 'expo-router/_ctx') {
    const ctxFile =
      platform === 'android' ? '_ctx.android.js' : platform === 'ios' ? '_ctx.ios.js' : '_ctx.js';
    const real = fs.realpathSync(path.resolve(projectRoot, 'node_modules/expo-router', ctxFile));
    return {
      filePath: real,
      type: 'sourceFile',
    };
  }

  // Handle bare module imports from symlinked pnpm packages using Node module resolution
  if (!moduleName.startsWith('.') && !moduleName.startsWith('/')) {
    try {
      const resolved = require.resolve(moduleName, {
        paths: [
          path.dirname(context.originModulePath),
          projectRoot,
          path.resolve(projectRoot, 'node_modules'),
          path.resolve(projectRoot, 'node_modules/expo/node_modules'),
        ],
      });
      return {
        filePath: fs.realpathSync(resolved),
        type: 'sourceFile',
      };
    } catch {}
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
