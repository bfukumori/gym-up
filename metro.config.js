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
    return {
      filePath: fs.realpathSync(path.resolve(projectRoot, 'node_modules/expo-router/entry.js')),
      type: 'sourceFile',
    };
  }
  if (
    moduleName === 'expo-router/entry-classic' ||
    moduleName === './node_modules/expo-router/entry-classic' ||
    moduleName === 'expo-router/entry-classic.js'
  ) {
    return {
      filePath: fs.realpathSync(
        path.resolve(projectRoot, 'node_modules/expo-router/entry-classic.js')
      ),
      type: 'sourceFile',
    };
  }

  try {
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  } catch (err) {
    if (!moduleName.startsWith('.') && !moduleName.startsWith('/')) {
      try {
        const resolved = require.resolve(moduleName, {
          paths: [path.resolve(projectRoot, 'node_modules')],
        });
        return {
          filePath: fs.realpathSync(resolved),
          type: 'sourceFile',
        };
      } catch {}
    }
    throw err;
  }
};

module.exports = config;
