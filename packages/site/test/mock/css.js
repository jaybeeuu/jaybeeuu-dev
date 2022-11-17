const handler = {
  get(target, prop) {
    return prop;
  }
};

export default new Proxy({}, handler);
