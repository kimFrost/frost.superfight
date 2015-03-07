// Generated on 2014-08-05 using generator-angular 0.9.5
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing deploy times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {}
      },
      images: {
        files: ['images/{,*/}*.{png,jpg,jpeg,gif,webp}'],
        tasks: ['copy:images'],
      },
      templates: {
        files: ['templates/{,*/}*.html'],
        tasks: ['copy:templates'],
      },
      fonts: {
        files: ['fonts/{,*/}*'],
        tasks: ['copy:fonts'],
      },
      compass: {
        files: ['styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:debug']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          './scripts/**/*.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      deploy: {
        options: {
          force: true
        },
        files: [{
          dot: true,
          src: [
            '.tmp',
            '.sass-cache',
            '../templates',
            '../images',
            '../css/fonts',
            '../css/libs.min.css',
            '../css/main.min.css',
            '../scripts/ie-shim.min.js',
            '../scripts/scripts.min.js',
            '../scripts/libs.min.js'
          ]
        }]
      },
      temp: {
        files: [{
          dot: true,
          src: [
            '.tmp'
          ]
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      options: {
        cwd: './'
      },
      app: {
        src: ['../Views/Master.cshtml'],
        ignorePath: '..',
        exclude: [/es5-shim/, /json3/]
      },
      sass: {
        src: ['styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: './styles',
        sourcemap: true,
        cssDir: '../css',
        generatedImagesDir: '.tmp/images/sprites',
        imagesDir: './images',
        javascriptsDir: './scripts',
        fontsDir: './fonts',
        importPath: './bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/assets/.tmp/images/sprites',
        httpFontsPath: '/assets/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      deploy: {
        options: {
          generatedImagesDir: '../images/sprites',
          httpGeneratedImagesPath: '/images/sprites',
          httpFontsPath: '/css/fonts',
          force: true
        }
      },
      debug: {
        options: {
          debugInfo: true
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart deploys that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '../Views/Master.cshtml',
      options: {
        dest: '../',
        assetsDirs: ['../'],
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    imagemin: {
      deploy: {
        files: [{
          expand: true,
          cwd: './',
          src: [
            'images/{,*/}*.{png,jpg,jpeg,gif}',
            '!images/util',
            '!images/icons',
            '!images/spr'
          ],
          dest: '../'
        }]
      }
    },

    svgmin: {
      deploy: {
        files: [{
          expand: true,
          cwd: './images',
          src: '{,*/}*.svg',
          dest: '../images'
        }]
      }
    },

    htmlmin: {
      deploy: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: false
        },
        files: [{
          expand: true,
          cwd: '../',
          src: ['templates/{,*/}*.html'],
          dest: '../'
        }]
      }
    },

    // ng-annotate tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection. It doesn't work on
    // things like resolve or inject so those have to be done manually.
    ngAnnotate: {
      deploy: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      deploy: {
        files: [{
            expand: true,
            dot: true,
            cwd: './',
            dest: '../',
            src: [
              'templates/{,*/}*.html',
              'images/{,*/}*.{webp}',
              'fonts/*'
            ]
          }, {
            expand: true,
            cwd: '.tmp/images',
            dest: '../images',
            src: ['sprites/*']
          }]
      },
      templates: {
        files: [{
          expand: true,
          dot: true,
          cwd: './',
          dest: '../',
          src: 'templates/{,*/}*.html',
        }]
      },
      images: {
        files: [{
          expand: true,
          dot: true,
          cwd: './',
          dest: '../',
          src: [
            'images/{,*/}*.{png,jpg,jpeg,gif,webp}',
            '!images/util',
            '!images/icons',
            '!images/spr'
          ]
        }]
      },
      fonts: {
        files: [{
          expand: true,
          dot: true,
          cwd: './',
          dest: '../',
          src: 'fonts/*'
        }]
      }
    },

    browserSync: {
      dev: {
        bsFiles: {
          src: [
            '../css/{,*/}*.css',
            '../templates/{,*/}*.html',
            './scripts/{,*/}*.js',
            '../Views/{,*/}*.cshtml'
          ]
        },
        options: {
          //proxy: '',
          watchTask: true,
          server: '../'
        }
      }
    },

    // Run some tasks in parallel to speed up the deploy process
    concurrent: {
      deploy: [
        'compass:deploy',
        'imagemin',
        'svgmin'
      ]
    }
  });

  grunt.registerTask('debug', [
    'clean:deploy',
    'wiredep',
	'compass:debug',
    'copy:images',
    'copy:templates',
    'copy:fonts',
    'watch'
  ]);

  grunt.registerTask('sync', [
    'clean:deploy',
    'wiredep',
	'compass:debug',
    'copy:images',
    'copy:templates',
    'copy:fonts',
    'browserSync',
    'watch'
  ]);

  grunt.registerTask('deploy', [
    'newer:jshint',
    'clean:deploy',
    'wiredep',
    'useminPrepare',
    'concurrent:deploy',
    'concat',
    'ngAnnotate',
    'copy:deploy',
    'cssmin',
    'uglify',
    'htmlmin',
    'clean:temp'
  ]);

  grunt.registerTask('default', [
    'debug'
  ]);
};
