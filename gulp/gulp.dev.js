let path = require('path');
let gulp = require('gulp');
let autoprefixer = require('gulp-autoprefixer');
let browserSync = require('browser-sync').create();
let less = require('gulp-less');
let sass = require('gulp-sass');
sass.compiler = require('node-sass');

gulp.task('less', function () {
  return gulp.src('../src/**/*.less')
    .pipe(less())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('../src'))
    .pipe(browserSync.stream())
});

gulp.task('scss', function () {
  return gulp.src('../src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('../src'))
    .pipe(browserSync.stream())
});

gulp.task('start',function() {
  browserSync.init({
    server: {
      baseDir: '../src', // 启动服务的目录 默认 index.html
      index: 'index.html' // 自定义启动文件名
    },
    open: 'external', // 决定Browsersync启动时自动打开的网址 external 表示 可外部打开 url, 可以在同一 wifi 下不同终端测试
    port: 3500,
    socket: {
        domain: 'localhost:3500'
    }
  });
  // browserSync.io('http://172.16.138.37:3500/browser-sync')
  gulp.watch('../src/**/*.less', gulp.series(['less']));
  gulp.watch('../src/**/*.scss', gulp.series(['scss']));
  gulp.watch("../src/**/*.html").on('change', browserSync.reload);
  gulp.watch("../src/**/*.js").on('change', browserSync.reload);
});

gulp.task('demo',gulp.series([],function() {
  browserSync.init({
    server: {
      baseDir: '../example', // 启动服务的目录 默认 index.html
      index: 'index.html' // 自定义启动文件名
    },
    open: 'external', // 决定Browsersync启动时自动打开的网址 external 表示 可外部打开 url, 可以在同一 wifi 下不同终端测试
    port: 3600,
    socket: {
      namespace: function(namespace) {
        return "localhost:3600" + namespace;
      }
    }
  });
}));

