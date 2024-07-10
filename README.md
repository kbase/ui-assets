# KBase static assets for UI

Store and serve static assets for KBase frontends.

- [KBase static assets for UI](#kbase-static-assets-for-ui)
  - [Directory structure and file names](#directory-structure-and-file-names)
  - [Development](#development)
    - [Run the server](#run-the-server)
    - [Delete and clean up docker](#delete-and-clean-up-docker)
  - [Jupyter Notebook Styling](#jupyter-notebook-styling)
  - [CSS Compilation](#css-compilation)
    - [Updating your npm packages](#updating-your-npm-packages)
    - [Building style files](#building-style-files)
    - [Style file styling](#style-file-styling)
    - [Autoprefixer](#autoprefixer)
    - [Stylelint](#stylelint)


## Directory structure and file names

Some conventions:

- Give images the filename format `{name}-width-height.{ext}` where `width` and `height` are in pixels.


## Development

### Run the server

With docker installed:

```
npm run server_up
```

Access the server from [`127.0.0.1:8080`](http://127.0.0.1:8080).

### Delete and clean up docker

Run:

```sh
npm run server_down
```

which will remove the image and container.


## Jupyter Notebook Styling

The KBase Narrative is based on [Jupyter Notebook](https://jupyter-notebook.readthedocs.io/en/stable/) v6.x (now known as the ["classic" notebook](https://github.com/jupyter/nbclassic)), which comes with some basic styling that the KBase narrative inherits and builds from. That style file and its dependencies are maintained within this repo to ensure that anyone using the KBase narrative styling can also access the styles upon which it is based.

Whenever the notebook is updated in the narrative repo, the accompanying style file should be updated in this repo. The easiest way to get the updated style file is to run the narrative locally using `kbase-narrative` and grab it from `http://localhost:8888/static/style/style.min.css`. The new `style.min.css` file should be added under [`assets/css`](assets/css).

The Jupyter notebook css [relies upon fonts](https://github.com/jupyter/nbclassic/blob/main/bower.json) from the `bootstrap` and `font-awesome` npm packages, which are specified in the `package.json` file in this repo. The font files from those packages are copied to [`assets/components/`](assets/components/) to mimic the structure that the notebook css file expects. The node task `copy_fonts` (`npm run copy_fonts`) can be used to update the font files in the unlikely event that these versions of the fonts change.


## CSS Compilation

KBase serves a concatenated, minified css file--[`all_concat.css`](assets/css/all_concat.css)--to minimise download size and HTTP hits. It is produced from the scss source files in [`scss`](scss) by an npm script which triggers the sass compiler and then runs postcss on the output.

The sass compiler is [available in a number of forms](https://sass-lang.com/dart-sass/), including [dart-sass](https://github.com/sass/dart-sass), the primary implementation, and [a JavaScript implementation](https://www.npmjs.com/package/sass). The latter is included in [`package.json`](package.json), but you can install and use the `dart-sass` implementation if you prefer.

The ui-assets repo has a number of npm and grunt tasks configured for developer use and convenience. They can be found in the `scripts` section of [`package.json`](package.json) and [`Gruntfile.js`](Gruntfile.js).

### Updating your npm packages

If you haven't already done so, run

```sh
npm install
```

to install and update the npm packages required by the narrative. If there are errors, you may need to remove the [`package-lock.json`](package-lock.json) file and/or the `node_modules` directory.

### Building style files

To update the generated css file, run the task:

```sh
npm run compile_css
```

If this is not run, edits to the scss source files will not be reflected in [`all_concat.css`](assets/css/all_concat.css).

There is also a `watch` task that will automatically generate the concatenated, minified css files when there is a change to the source files. If you plan to make changes to frontend styling, run

```sh
grunt watch
```

in a terminal window to launch a watcher process that regenerates the css file when changes are made.

### Style file styling

The narrative repo uses the [PostCSS](https://github.com/postcss/postcss) system for post-processing css; this includes [minification](https://cssnano.github.io/cssnano/) and [Autoprefixer](https://github.com/postcss/autoprefixer) for adding browser prefixes. SCSS linting is provided by [Stylelint](https://stylelint.io).

**Additions to the source files should be written without vendor prefixes as these will be added automatically.**

### Autoprefixer

The narrative repo uses [Autoprefixer](https://github.com/postcss/autoprefixer) to add browser prefixes to css, with the browser support list set to Autoprefixer's `default` setting. The `update_browserslist` npm script is used by Autoprefixer to pull in the latest browser configurations, and is run as a git hook. If running the script returns a message that the list of browsers has been updated, please commit the updated `package-lock.json` file.

For more information, see the [browserslist best practices and updating sections](https://github.com/browserslist/browserslist#best-practices).

### Stylelint

To lint the scss files, run the command

```
npm run stylelint
```

The linter config (in `.stylelint.yaml`) includes a number of rules to ensure that the scss content is error-free and (relatively) uniform. Running it will automatically fix some stylistic issues (e.g. ordering of lines within stanzas), but others may need to be fixed manually. Please note there are some issues in the SCSS files that are more difficult to fix, due to the styling set in the Jupyter notebook css.
