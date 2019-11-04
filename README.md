# KBase static assets for UI

Store and serve static assets for KBase frontends.

## Directory structure and file names

Some conventions:

- Give images the filename format `{name}-width-height.{ext}` where `width` and `height` are in pixels.

## Development

### Run the server

With docker installed:

```
make serve
```

Access the server from `localhost:8080`.

### Delete and clean up docker

Run: `make down`, which will remove the image and container.
