const path = require("path");
const env = require("dotenv").config({ path: "variables.env" });
const nodeEnv = process.env.NODE_ENV || env.parsed.NODE_ENV;

const javascriptConfig = {
    test: /\.(js)$/, // match anything that ends in `.js`
    exclude: /node_modules/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env"],
      },
    },
};

const imageConfig = {
    test: /\.(png|svg|jpg|jpeg|gif)$/i,
    type: 'asset/resource'
}

const config = {
    mode: nodeEnv,
    entry: {
        // we only have 1 entry, but I've set it up for multiple in the future
        App: "./public/javascript/main.js"
    },
    output: {
        path: path.resolve(__dirname, "public", "dist"),
        // we can use "substitutions" in file names like [name] and [hash]
        // name will be `App` because that is what we used above in our entry
        filename: "[name]_[contenthash].bundle.js",
        clean: true, // erases all existing js files and replaces them
        assetModuleFilename: '[name][ext]', // for images
    },
    devTool: 'source-map',
    module: {
        rules: [javascriptConfig, imageConfig]
    }
}

module.exports = config;