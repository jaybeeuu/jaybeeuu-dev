const options = {
  "rules": {
    arrays: "replace"
  }
};

const defaultOptions = {
  arrays: "concat"
};

const mergeConfigEntry = (left, right, path, { arrays } = defaultOptions) => {
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
    switch(arrays) {
      case "replace": return left;
      case "merge": return left.map((leftValue, i) => mergeConfigEntry(leftValue, right[i]));
      case "concat":
      default: return [...left, ...right];
    }
  }

  if (typeof left === "object" && typeof right === "object") {
    return Object.entries(right).reduce((acc, [key, rightValue]) => {
      const resolvedOptions = options[key] || defaultOptions;
      acc[key] = mergeConfigEntry(
        left[key],
        rightValue,
        resolvedOptions
      );

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

const mergeConfig = (...configFragments) => {
  if (configFragments.length <= 1) {
    const finalConfig = {
      ...configFragments[0],
      overrides: Object.values(configFragments[0].overrides)
    }

    return finalConfig;
  }
  const [left, right, ...otherConfigs] = configFragments;
  const leftmost = mergeConfigEntry(left, right);

  return mergeConfig(leftmost, ...otherConfigs);
};

module.exports = {
  base: require('./configs/base-eslintrc.json'),
  jest: require('./configs/jest-eslintrc.json'),
  mergeConfig
};