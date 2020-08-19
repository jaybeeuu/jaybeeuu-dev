module.exports = {
  hooks: {
    readPackage
  }
};

function readPackage (pkg, context) {
  if (pkg.name === "@prefresh/webpack" && pkg.version.startsWith("1.0")) {
    pkg.peerDependencies = {
      ...pkg.peerDependencies,
      webpack: "^4.0.0 || ^5.0.0"
    };
    context.log("@prefresh/webpack@~1.0.0 fix webpack peer dependency.");
  }

  return pkg;
}
