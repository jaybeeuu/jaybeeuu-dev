const readPackage = (pkg, context) => {
  if (pkg.name === "markdown-spellcheck" && pkg.version === "1.3.1") {
    const { "sinon-as-promised": sinonAsPromised, ...dependencies } =
      pkg.dependencies;

    pkg.dependencies = dependencies;
    pkg.devDependencies = {
      ...pkg.devDependencies,
      "sinon-as-promised": sinonAsPromised,
    };
    context.log(
      "markdown-spellcheck, dependency sinon-as-promised => devDependencies",
    );
  }

  // @octokit/types 9.1.0 is broken: https://github.com/octokit/types.ts/issues/525
  if (pkg.name === "@octokit/core") {
    pkg.dependencies = {
      ...pkg.dependencies,
      "@octokit/types": "9.0.0",
    };
    context.log("@octokit/core, dependency @octokit/types => pinned to 9.0.0");
  }

  return pkg;
};

module.exports = {
  hooks: {
    readPackage,
  },
};
