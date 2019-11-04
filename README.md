# KBase static assets for UI

Store and serve static assets for KBase frontends.

## Directory structure and file names

Some conventions:

- Give images the filename format `{name}-width-height.{ext}` where `width` and `height` are in pixels.

For JPEG and PNG images, compress them before committing. We recommend one of these utils:

* JPEG: [Guetzli](https://github.com/google/guetzli)
* PNG: [pngquant](https://pngquant.org)

More info can be found here: https://developers.google.com/web/tools/lighthouse/audits/optimize-images

## Development

### Run the server

With docker installed:

```
make serve
```

Access the server from `localhost:8080`.

### Delete and clean up docker

Run: `make down`, which will remove the image and container.
