'use strict';

import plugins  from 'gulp-load-plugins';
import yargs    from 'yargs';
import browser  from 'browser-sync';
import gulp     from 'gulp';
import panini   from 'panini';
import rimraf   from 'rimraf';
import sherpa   from 'style-sherpa';
import yaml     from 'js-yaml';
import fs       from 'fs';
import localScreenshots from 'gulp-local-screenshots';
import imageResize from 'gulp-image-resize';
import autoprefixer from 'gulp-autoprefixer';
import remoteSrc from 'gulp-remote-src';
import request  from 'request';
import htmlmin  from 'gulp-htmlmin';

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// Load settings from settings.yml
const { COMPATIBILITY, PORT, SSPORT, UNCSS_OPTIONS, PATHS, GITHUB } = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

var resizeImageTasks = [];

[150,320,480,768,1200].forEach(function(size) {
  var resizeImageTask = 'resize_' + size;
  gulp.task(resizeImageTask, function() {
    return gulp.src('src/assets/img/portfolio/**/*.{jpg,png,tiff}')
      .pipe(imageResize({
         width:  size,
         //height: size,
         upscale: false,
         imageMagick: true
       }))
      .pipe($.imagemin({
        progressive: true
      }))
      .pipe(gulp.dest(PATHS.dist + '/assets/img/portfolio/' + size + '/'))
  });
  resizeImageTasks.push(resizeImageTask);
});

//resize static portfolio images
gulp.task('resize_images',
  gulp.series(resizeImageTasks));

// Build the "dist" folder by running all of the below tasks
gulp.task('build',
 gulp.series(clean, gulp.parallel(pages, sass, javascript, copy, 'resize_images', images)));

// Build the site, run the server, and watch for file changes
gulp.task('default',
  gulp.series('build', styleGuide, server, watch));

// create screenshots of index page.
gulp.task('screenshot',
  gulp.series(screens));

// create screenshots of index page.
gulp.task('github',
  gulp.series(github));

function github() {

  var options = {
    url: 'https://api.github.com/users/' + GITHUB.handle + '/repos',
    headers: {
      'User-Agent': 'request'
    }
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {

      // save response to json file
      //var json = JSON.stringify(body);
      var json = body;
      var fs = require('fs');
      fs.writeFile('src/data/' + GITHUB.jsonfilename + '.json', json, 'utf8', (err) => {
        if (err){
          console.log(e);
          throw err;
        }
      });
    }
  }

  return request(options, callback);

}


// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
  rimraf(PATHS.dist, done);
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
function copy() {
  return gulp.src(PATHS.assets)
    .pipe(gulp.dest(PATHS.dist + '/assets'));
}

// Copy page templates into finished HTML files
function pages() {
  return gulp.src('src/pages/**/*.{html,hbs,handlebars}')
    .pipe(panini({
      root: 'src/pages/',
      layouts: 'src/layouts/',
      partials: 'src/partials/',
      data: 'src/data/',
      helpers: 'src/helpers/'
    }))
    .pipe($.if(PRODUCTION, $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest(PATHS.dist));
}

// Load updated HTML templates and partials into Panini
function resetPages(done) {
  panini.refresh();
  done();
}

// Generate a style guide from the Markdown content and HTML template in styleguide/
function styleGuide(done) {
  sherpa('src/styleguide/index.md', {
    output: PATHS.dist + '/styleguide.html',
    template: 'src/styleguide/template.html'
  }, done);
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
  return gulp.src('src/assets/scss/app.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: PATHS.sass
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    // Comment in the pipe below to run UnCSS in production
    //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
    .pipe($.if(PRODUCTION, $.cssnano()))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/assets/css'))
    .pipe(browser.reload({ stream: true }));
}

// Combine JavaScript into one file
// In production, the file is minified
function javascript() {
  return gulp.src(PATHS.javascript)
    .pipe($.sourcemaps.init())
    .pipe($.babel({ignore: ['what-input.js']}))
    .pipe($.concat('app.js'))
    .pipe($.if(PRODUCTION, $.uglify()
      .on('error', e => { console.log(e); })
    ))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
  return gulp.src('src/assets/img/**/*')
    //.pipe($.if(PRODUCTION, $.imagemin({
    .pipe($.imagemin({
      progressive: true
    //})))
    }))
    .pipe(gulp.dest(PATHS.dist + '/assets/img'));
}


// create screenshots of index page.
function screens() {
  return gulp.src(PATHS.dist + '/index.html')
    .pipe(localScreenshots({
      width: ['1200', '768', '480', '320'],
      port: SSPORT, // default 8080 is in use
      folder: PATHS.dist + '/assets/ss',
      path: PATHS.dist + '/',
     }))
}

// Start a server with BrowserSync to preview the site in
function server(done) {
  browser.init({
    server: PATHS.dist, port: PORT
  });
  done();
}

// Reload the browser with BrowserSync
function reload(done) {
  browser.reload();
  done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
  gulp.watch(PATHS.assets, copy);
  gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, browser.reload));
  gulp.watch('src/{layouts,partials}/**/*.html').on('all', gulp.series(resetPages, pages, browser.reload));
  gulp.watch('src/assets/scss/**/*.scss').on('all', sass);
  gulp.watch('src/assets/js/**/*.js').on('all', gulp.series(javascript, browser.reload));
  gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
  gulp.watch('src/styleguide/**').on('all', gulp.series(styleGuide, browser.reload));
}
