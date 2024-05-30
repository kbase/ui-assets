module.exports = function (grunt) {
    'use strict';
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // Run CSS / SCSS-related tasks
        // these files are modified in place
        postcss: {
            // autoprefix and minify the concatenated css files
            concat: {
                options: {
                    processors: [
                        // add vendor prefixes
                        require('autoprefixer')(),
                        // minify
                        require('cssnano')([
                            'default',
                            {
                                normalizeWhitespace: {
                                    exclude: true,
                                },
                            },
                        ]),
                    ],
                },
                src: ['assets/css/all_concat.css'],
            },
        },

        // runs the npm command to compile scss -> css and run autoprefixer on it
        shell: {
            compile_css: {
                command: 'npm run compile_css',
            },
        },

        // watch scss files for any changes
        // when they change, regenerate the compiled css files
        watch: {
            files: 'scss/**/*.scss',
            tasks: ['shell:compile_css'],
        },
    });
};
