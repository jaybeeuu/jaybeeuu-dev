const readPackage = (pkg, context) => {
  if (pkg.name === "markdown-spellcheck" && pkg.version === "1.3.1") {
    const { "sinon-as-promised": sinonAsPromised, ...dependencies } = pkg.dependencies;

    pkg.dependencies = dependencies;
    pkg.devDependencies = {
      ...pkg.devDependencies,
      "sinon-as-promised": sinonAsPromised
    };
    context.log("markdown-spellcheck, dependency sinon-as-promised => devDependencies");
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
