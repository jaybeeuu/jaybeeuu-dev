const baseConfig = require('./base-eslintrc.json');

module.exports.baseConfig = baseConfig;

const mergeConfigEntry = (left, right) => {
  if (right === undefined) {
    return left;
  }

  if (left === undefined) {
    return right;
  }

  if (right === null) {
    return right;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return right;
  }

  if (typeof left === "object" && typeof right === "object") {
    return Object.entries(right).reduce((acc, [key, rightValue]) => {
      acc[key] = mergeConfigEntry(left[key], rightValue);

      if (acc[key] === undefined) {
        delete acc[key];
      }

      return acc;
    }, { ...left }) ;
  }

  if (typeof left !== typeof right) {
    throw new Error([
      "Types of left and right objects do not match:",
      `Left: ${JSON.stringify(left)}`,
      `Right: ${JSON.stringify(right)}`,
    ].join("\n"));
  }

  return right;
};

module.exports.mergeConfig = (...configFragments) => {
  if (configFragments.length <= 1) {
    const finalConfig = {
      ...configFragments[0],
      overrides: Object.values(configFragments[0].overrides)
    }

    return finalConfig;
  }
  const [left, right, ...otherConfigs] = configFragments;
  const leftmost = mergeConfigEntry(left, right);

  return this.mergeConfig(leftmost, ...otherConfigs);
};