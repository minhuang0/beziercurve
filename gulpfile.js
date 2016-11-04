var gulp = require('gulp'),
    connect = require('gulp-connect'),
    babel = require('gulp-babel'),
    browserify = require("browserify"),
    source = require('vinyl-source-stream');

gulp.task('connect', function() {
    connect.server({
        root: './',
        port: 8008,
        livereload: true
    });
});

gulp.task('scripts', function () {
    return browserify({entries: './src/js/index.js'})
        .transform('babelify', {presets: ['es2015']})
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload());
});

gulp.task('build', ['scripts']);

gulp.task('watch',function(){
    gulp.watch('src/**/*.js', ['scripts']);
});

gulp.task('default', ['build'], function() {
    gulp.start(['connect', 'watch']);
});
