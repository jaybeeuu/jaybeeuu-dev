process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

const env = require("./env");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const config = require("./webpack.config");

const compiler = webpack(config);
const serverConfig = require("./webpack-dev-server.config");

const devServer = new WebpackDevServer(compiler, serverConfig);

const PORT = env.PORT;
const HOST = env.HOST;

devServer.listen(PORT, HOST);

["SIGINT", "SIGTERM"].forEach((sig) => {
  process.on(sig, () => {
    devServer.close(
      () => process.exit()
    );
  });
});