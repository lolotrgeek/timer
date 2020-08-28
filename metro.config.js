// metro.config.js
const { createMetroConfiguration } = require("expo-yarn-workspaces")

const config = createMetroConfiguration(__dirname)

// Make react-native import from files in other workspace resolve to node_modules in this dir
config.resolver.extraNodeModules["node"] = `${__dirname}/android/app/src/main/assets/nodejs-project/`
// config.resolver.extraNodeModules["react-native"] = `${__dirname}/node_modules/react-native`

// Default metro config
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
})

module.exports = config