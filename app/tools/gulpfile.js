/*
*
* Gulpfile
* Basic config
*
*/

/* ==========================================================================
    INCLUDES
============================================================================= */
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var uncss = require('gulp-uncss');
var minifyCSS = require('gulp-minify-css');
var concatCss = require('gulp-concat-css');
var less = require('gulp-less');
var stripCssComments = require('gulp-strip-css-comments');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var minifyHTML = require('gulp-minify-html');
var merge = require('merge2');
var autoprefixer = require('gulp-autoprefixer');
var clean = require('gulp-clean');
var livereload = require('gulp-livereload');
var notifier = require('node-notifier');
var del = require('del');
var order = require('gulp-order');
var del = require('del');
var exec = require('child_process').exec;
var runSequence = require('run-sequence');
var wait = require('gulp-wait');
var flatten = require('gulp-flatten');
var replace = require('gulp-replace');
/* ==========================================================================
    FOLDERS
============================================================================= */
var srcAssets = '../src/assets'; // Assets folder
var srcJekyll = '../src/jekyll'; // Jekyll folder
var vendor = '../vendor'; // Libraries folder
var dest = '../../build'; // Destination (build) folder
/* ==========================================================================
    TASKS
============================================================================= */

/* Tasks list :
* gulp clean
* gulp html
* gulp javascript
* gulp less
* gulp fonts
* gulp images
* gulp libJS
* gulp libCSS
* gulp watch
* gulp build
* gulp
*/


/* ===== CLEAN START ===== */
// Delete everything in destination folder
gulp.task('clean', function (cb) {
  del([dest + '/**/*'], {force: true}, cb);
});
/* ===== CLEAN END ===== */

/* ===== CLEAN START ===== */
// Delete everything in destination folder
gulp.task('cleanPosts', function (cb) {
  del([dest + '/0000'], {force: true}, cb);
});
/* ===== CLEAN END ===== */



/* ===== HTML START ===== */
/*gulp.task('html', function() {
  var options = {
    cdata: false,               // do no strip CDATA from scripts
    comments: false,            // do not remove comments
    quotes: false,              // do not remove arbitrary quotes
    conditionals: true,         // do not remove conditional IE comments
    spare: true,                // do not remove redundant attributes
    empty: true,                // do not remove empty attributes
    loose: false                // preserve one whitespace
  };

  // Get files
  return gulp.src(src + '/html/*.html')
    // Minify files
    .pipe(minifyHTML(options))
    // Output files
    .pipe(gulp.dest(dest));
});*/
/* ===== HTML END ===== */


/* ===== JAVASCRIPT START ===== */
gulp.task('js', function() {
    // Get files
    return gulp.src(srcAssets + '/js/*.js')
        // Concatenate in a single file
        .pipe(concat('main.js'))
        // Compression
        .pipe(uglify())
        // Output file
        .pipe(gulp.dest(dest+ '/js'))
});
/* ===== JAVASCRIPT END ===== */


/* ===== LESS START ===== */
gulp.task('less', function() {
    // Get static styles
    var streamMain = gulp.src([
        srcAssets + '/less/**/*.less',
        srcAssets + '!/less/**/interactive.less',])
        // Convert to CSS
        .pipe(less())
        // Remove unused CSS rules
         

    // Get dynamic styles
    var streamEvents = gulp.src(srcAssets + '/less/global/interactive.less')
        // Convert to CSS
        .pipe(less())

    // Merge dynamic and static styles
    return merge(streamMain, streamEvents)
        // Concatenate in a single file
        .pipe(concat('main.css'))
        // Remove all comments
        .pipe(stripCssComments({
            all: true
        }))
        // Autoprefixer for browser compatibility
        .pipe(autoprefixer())
        // Compression
        .pipe(minifyCSS())
        // Output file
        .pipe(gulp.dest(dest + '/css'));
});
/* ===== LESS END ===== */


/* ===== FONTS START ===== */
gulp.task('fonts', function() {
    // Get files
    return gulp.src(srcAssets + '/fonts/**/*.{ttf,woff,woff2,eot,svg}')
        // Copy files to destination
        .pipe(gulp.dest(dest +'/fonts'));
});
/* ===== FONTS END ===== */


/* ===== IMAGES START ===== */
gulp.task('images', function () {
    return gulp.src(srcAssets + '/images/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(dest + '/images'));
});
/* ===== IMAGES END ===== */

/* ===== IMAGES START ===== */
gulp.task('jekyllBuild', function (){
    exec('jekyll build', function(err, stdout, stderr) {
        console.log(stdout);
    });
});
/* ===== IMAGES START ===== */
gulp.task('jekyll', function (callback){
    runSequence('jekyllBuild', 'wait', 'cleanPosts', callback);
});

/* ===== JS LIB START ===== */
gulp.task('libJS', function() {
    // Define libraries locations
    var jquery = gulp.src(vendor + '/jquery/dist/jquery.min.js');
    var bootstrapJs = gulp.src(vendor + '/bootstrap/dist/js/bootstrap.min.js');
    var jqueryui = gulp.src(vendor + '/jquery-ui/jquery-ui.min.js');
    var slickJs = gulp.src(vendor + '/slick.js/slick/slick.min.js');
    var materializeJs = gulp.src(vendor + '/materialize/dist/js/materialize.min.js');

    // Merge libraries
    return merge(jquery, bootstrapJs, jqueryui, slickJs, materializeJs)
        // Order of concatenation, jQuery first
        .pipe(order([
            '../vendor/jquery/dist/jquery.min.js',
            '../vendor/bootstrap/dist/js/bootstrap.min.js',
            '../vendor/jquery-ui/jquery-ui.min.js',
            '../vendor/slick.js/slick/slick.min.js',
            '../vendor/materialize/dist/js/materialize.min.js'
            ], { base: './' }))
        // Concatenate in a single file
        .pipe(concat('vendor.js'))
        // Output file
        .pipe(gulp.dest(dest + '/js'))
});
/* ===== JS LIB END ===== */


/* ===== CSS LIB START ===== */
gulp.task('libCSS', function() {
    // Define libraries locations
    var bootstrapCss = vendor + '/bootstrap/dist/css/bootstrap.min.css';
    var slickCss = vendor + '/slick.js/slick/slick.css';
    var slickCss2 = vendor + '/slick.js/slick/slick-theme.css';
    var materializeCss = vendor + '/materialize/dist/css/materialize.min.css';
    var fontawesomeCSS = vendor + '/font-awesome/css/font-awesome.min.css';

    // Merge libraries
    return gulp.src([bootstrapCss, slickCss, slickCss2, materializeCss, fontawesomeCSS])
        // Concatenate in a single file
        .pipe(concatCss('vendor.css', {rebaseUrls:false}))
        .pipe(minifyCSS())
        .pipe(replace(
            'fonts/slick',
            '../fonts/slick'
            ))
        .pipe(replace(
            'ajax-loader.gif',
            '../images/ajax-loader.gif'
            ))
        .pipe(gulp.dest(dest + '/css'));
});



/* ===== FONTS LIB START ===== */
gulp.task('libFonts', function() {
    // Define libraries locations
    var matFonts = gulp.src(vendor + '/materialize/font/material-design-icons/*.{ttf,woff,woff2,eot,svg}')
    var fontawesome = gulp.src(vendor + '/font-awesome/fonts/*.{ttf,woff,woff2,eot,svg}')
    var slick = gulp.src([vendor + '/slick.js/slick/fonts/*.{ttf,woff,woff2,eot,svg}', vendor + 'slick.js/slick/ajax-loader.gif'])
    matFonts
        // Copy file to destination
        .pipe(gulp.dest(dest +'/fonts/material-design-icons'));
    fontawesome
        // Copy file to destination
        .pipe(gulp.dest(dest + '/fonts'));
    slick
        // Copy file to destination
        .pipe(gulp.dest(dest + '/fonts'));
});


/* ===== WATCH START ===== */
gulp.task('watch', function() {

    // Folders to watch and tasks to execute
    gulp.watch([srcAssets + '/fonts/*'], ['fonts']);
    gulp.watch([srcAssets + '/less/*'], ['less']);
    gulp.watch([srcAssets + '/js/*'], ['js']);
    gulp.watch([srcAssets + '/img/*'], ['img']);
    gulp.watch([srcJekyll + '/**/*.html'], ['jekyll']);

    livereload.listen();
    // When dest changes, tell the browser to reload
    gulp.watch(dest + '/**').on('change', livereload.changed);
});
/* ===== WATCH END ===== */

/* ===== WAIT ===== */
gulp.task('wait', function() {
    return gulp.src('gulpfile.js')
    .pipe(wait(3000));
});


/* ===== NOTIFY ===== */
gulp.task('notify', function() {
    notifier.notify({
        'title': 'Jekyll Builder',
        'message': 'Task completed',
        'icon': 'C:/Dev/ink/notifier-icon.png'
    });
});

/* ===== BUILD START ===== */
// Clean destination then build
gulp.task('build', function(callback) {
  runSequence('clean',
              ['jekyllBuild','less', 'js', 'fonts', 'images', 'libCSS', 'libJS', 'libFonts'],
              'cleanPosts',
              'notify',
              callback);
});
/* ===== BUILD END ===== */

/* ===== AND WATCH ===== */
// Clean destination then build
gulp.task('and-watch', function(callback) {
  runSequence('build',
              'watch',
              callback);
});
/* ===== BUILD END ===== */


/* ===== DEFAULT START ===== */
// Default gulp task ($ gulp)
gulp.task('default', ['build'], function() {
});
/* ===== DEFAULT END ===== */