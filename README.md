# nginx

This is a repo i am using to learn how to setup and configure NGINX. The goal here is to habe it run in a docker container with some static content, proxied to a webpack dev server for development. There will also be an express server providing the backend.

I may at some point add n redis into the mix. although i'm not sure yet what that will bring to the party...

As it stands the contents of this repo work reasonably well. I think this is the basis for my website. A Python backend, running Sanic, with a react/redux front end served up by nginx.

Using nginx will allow me to scale up the backend with some load balancing if need be and i will also be able to add things like redis caching to help out. To be honest though it is unlikely i will need to so the first step is to get the thing into an environment and have it show something...


### `Alias` vs `Root`

First job is serving some static content. Which is easy


```conf
events {
    worker_connections: 1024;
}

http {
    server {
        location /static/ {
            root /var/www/content/;
        }
    }
}
```

In your `nginx.conf` is all you need.


However... Using this configurtaion the url `/static/index.html` will be looked up as `/var/www/content/static/index.html`. Turns out the way to fix that is by using `alias`.

The most important difference between `alias` and `root` is that files looked up with `root` will have the whole url path appended, while file behind an `alias` will only be looked up using hte unmatched portion of the url.


Meanwhile substituting `root` for `alias` means the file would be looked up at `/var/www/content/index.html`.

More details on [this](https://stackoverflow.com/questions/10631933/nginx-static-file-serving-confusion-with-root-alias) stack overflow question and on the docs for [alis](http://nginx.org/en/docs/http/ngx_http_core_module.html#alias) and [root](http://nginx.org/en/docs/http/ngx_http_core_module.html#root).
