process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const config = require("./webpack.config");

const compiler = webpack(config);
const serverConfig = require("./webpack-dev-server.config");

const devServer = new WebpackDevServer(compiler, serverConfig);

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

devServer.listen(PORT, HOST);

["SIGINT", "SIGTERM"].forEach((sig) => {
  process.on(sig, () => {
    devServer.close(
      () => process.exit()
    );
  });
});