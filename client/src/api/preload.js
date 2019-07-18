import "whatwg-fetch";

const preload = (...urls) => urls.forEach(url => fetch(url));

export default preload;