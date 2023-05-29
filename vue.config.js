const { argv } = require("yargs");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  productionSourceMap: false,
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    // entry: {
    //   app: [
    //     './src/main.js'
    //   ]
    // },
    optimization: {
      // We no not want to minimize our code.
      minimize: true,
    },
    resolve: {
      alias: {
        "@": require("path").resolve(__dirname, "src"),
      },
      extensions: [".js", ".vue", ".json", ".ts"],
    },
  },

  devServer: {
    proxy: "http://localhost:8000",
    headers: { "Access-Control-Allow-Origin": "*" },
    watchOptions: {
      clientLogLevel: "warning",
    },
  },

  // publicPath: '',
  //  outputDir: "./devcore-cordova/www/",
  outputDir: "../devcore_server_lavarel/public/mobile",
  publicPath: "./",
  pluginOptions: {
    cordovaPath: "devcore-cordova",
  },
  chainWebpack: (config) => {
    console.log("_________________");
    console.log(`Building app with environment: ${process.env.BASE}`);
    console.log("_________________");
    config.resolve.alias.set("@", path.join(__dirname, "./src"));

    const svgRule = config.module.rule("svg");
    svgRule.uses.clear();

    svgRule
      .oneOf("inline")
      .resourceQuery(/inline/)
      .use("vue-svg-loader")
      .loader("vue-svg-loader")
      .options({
        svgo: {
          plugins: [{ removeDimensions: true }, { removeViewBox: false }],
        },
      })
      .end()
      .end()
      .oneOf("external")
      .use("file-loader")
      .loader("file-loader")
      .options({
        name: "assets/[name].[hash:8].[ext]",
      });

    config.module
      .rule("vue")
      .use("vue-loader")
      .loader("vue-loader")
      .tap((options) => {
        options.transformAssetUrls = {
          img: "src",
          image: "xlink:href",
          "b-avatar": "src",
          "b-img": "src",
          "b-img-lazy": ["src", "blank-src"],
          "b-card": "img-src",
          "b-card-img": "src",
          "b-embed": "src",
        };
        return options;
      });
  },
};

