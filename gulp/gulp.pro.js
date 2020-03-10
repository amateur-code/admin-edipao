let minifycss = require('gulp-minify-css');
let uglify = require('gulp-uglify');
let zip = require('gulp-zip');
let gulp = require('gulp');
let del = require('del');
let replace = require('gulp-replace');
let gulpsync = require('gulp-sync')(gulp);
var config = require('../package.json');

gulp.task('clean', function(cb) {
  return del(['../build/**/*'],{
    force: true
  }, cb);
});

gulp.task('copy', function() {
  return gulp.src('../src/**/*')
    .pipe(gulp.dest('../build'));
});

gulp.task('minifycss', function() {
  return gulp.src('../build/**/*.css')
  	.pipe(minifycss())
    .pipe(gulp.dest('../build'))
});

gulp.task('replace', function() {
  return gulp.src(['../build/**/*.html'])
    .pipe(replace('VERSION', new Date().getTime()))
    .pipe(gulp.dest('../build'));
});

gulp.task('uglify', function() {
  return gulp.src('../build/**/*.js')
  	.pipe(uglify())
    .pipe(gulp.dest('../build'))
});

gulp.task('zip', function() {
  return gulp.src('../build/**/*')
    .pipe(zip('release-' + config.version + '.zip'))
    .pipe(gulp.dest('../release/'))
});


gulp.task('build',gulp.series(gulpsync.async(['clean','copy','minifycss','replace','zip'])));