var gulp = require('gulp'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	del = require('del'),
	bowerDir = __dirname + '/lib',
	app = __dirname + '/render',
	dist = __dirname,
	cleans = ['jquery.render.min.js', 'jquery.render.min.js.map'];
var files = ['jquery.render.js',
			'jquery.factory.js',
			'jquery.module.js',
			'jquery.form.js',
			'jquery.pin.js',
			'jquery.tabs.js',
			'jquery.page.js'];
gulp.task('script', ['clean'], function(){
	return gulp.src(fullFilepath(files, app))
  	.pipe(sourcemaps.init())
	.pipe(concat('jquery.render.js'))
    // .pipe(gulp.dest(dist))
  	.pipe(rename({suffix: '.min'}))
  	.pipe(uglify())
  	.pipe(sourcemaps.write(dist))
    .pipe(gulp.dest(dist));
});
gulp.task('clean', function(cb){
	del(fullFilepath(cleans, dist));
	cb(null);
});

gulp.task('watch', function(){
	return gulp.watch(app + '/**/*.js', ['build']);
});

gulp.task('build', ['script']);

function fullFilepath(arr, dir){
	var array = [];
	for(var i = 0; i < arr.length; i++){
		array.push (dir + '/' + arr[i]);
	}
	return array;
}