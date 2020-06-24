const path = require('path');
const { override, addBabelPlugins, addBabelPresets, babelInclude, disableEsLint, addWebpackModuleRule, babelExclude } = require('customize-cra');
const fs = require("fs");

// Toolbar fix for react-native-vector-icons
// https://github.com/oblador/react-native-vector-icons/issues/1104#issuecomment-599393489
// (() => {
//   const filePath = require.resolve(`react-native-vector-icons/lib/toolbar-android.js`);
//   const code = fs.readFileSync(filePath).toString();
//   fs.writeFileSync(filePath, code.replace(`import { ToolbarAndroid } from './react-native';`, `import ToolbarAndroid from '@react-native-community/toolbar-android';`));
// })();


// Fix for dependency error, https://github.com/amark/gun/issues/743#issuecomment-491440313
// module.exports = function override(config, env) {
//   config.module = {noParse: /gun\.js$/, ...config.module }  
//   return config
// }

// module.exports = override(
//   disableEsLint(),
//   ...addBabelPlugins(
//     '@babel/plugin-proposal-class-properties',
//     "@babel/plugin-proposal-object-rest-spread",
//     "@babel/plugin-transform-flow-strip-types"
//     ),
//   ...addBabelPresets([
//     "@babel/preset-env", { useBuiltIns: "usage" }],
//     "@babel/preset-react",
//     "@babel/preset-flow",
//     "@babel/preset-typescript",
//     ["babel-preset-react-app/dependencies",{ helpers: true }]),
//   babelInclude([
//     // path.resolve(__dirname, 'node_modules/react-native-elements'),
//     // path.resolve(__dirname, 'node_modules/@react-native-community/slider'),
//     // path.resolve(__dirname, 'node_modules/@react-native-community/datetimepicker'),
//     // path.resolve(__dirname, 'node_modules/react-native-vector-icons'),
//     // path.resolve(__dirname, 'node_modules/react-native-ratings'),
//     path.resolve(__dirname, 'node_modules/react-native-gesture-handler'),
//     path.resolve(__dirname, 'src'),
//   ]),
//   babelExclude([/react-native-web/, /\.(native|ios|android)\.(ts|js)x?$/]),
//   addWebpackModuleRule({test: /(@?react-(navigation|native)).*\.(ts|js)x?$/})
// )

// reduce web bundle size by filtering out any native modules
// https://github.com/babel/babel/discussions/11694
module.exports = function override(config, env) {
    config.module.rules.push({
        test: /(@?react-(navigation|native)).*\.(ts|js)x?$/,
        exclude: [/react-native-web/, /\.(native|ios|android)\.(ts|js)x?$/],
        use: {
            loader: "babel-loader",
            options: {
                // Disable reading babel configuration
                babelrc: false,
                configFile: false,

                // The configuration for compilation
                presets: [
                    [
                        require.resolve('babel-preset-react-app/dependencies'),
                        { helpers: true },
                    ],
                    ['babel-preset-react-app'],
                ],
                plugins: [
                    "@babel/plugin-proposal-class-properties",
                    "@babel/plugin-proposal-object-rest-spread"
                ]
            }
        }
    });

    return config;
};