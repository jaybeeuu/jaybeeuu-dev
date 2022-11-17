const handler: ProxyHandler<Record<string, string>> = {
  get(target, prop) {
    return prop;
  }
};

export const imageUrls = new Proxy({}, handler);
