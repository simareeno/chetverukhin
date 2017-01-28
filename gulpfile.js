var gulp = require('gulp'),
		path = require('path'),
		pug = require('gulp-pug'),
		less = require('gulp-less'),
		autoprefixer = require('autoprefixer'),
		minify = require('cssnano'),
		sourcemaps = require('gulp-sourcemaps'),
		concat = require('gulp-concat'),
		plumber = require('gulp-plumber'),
		notify = require('gulp-notify'),
		uglify = require('gulp-uglify'),
		postcss = require('gulp-postcss'),
		join = path.join;



var DEST = 'out',
		SRC = 'src',
		TEMPLATES = join(SRC, 'templates'),
		STYLES = join(SRC, 'styles'),
		SCRIPTS = join(SRC, 'scripts');



gulp.task('less', function() {

	var processors = [
		autoprefixer({browsers: ['last 2 versions']}),
		minify()
	];

	return gulp.src(join(STYLES, '*.less'))
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: "LESS",
					message: err.message
				}
			})
		}))
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(postcss(processors))
		.pipe(concat('styles.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(join(DEST, 'styles')));
});



gulp.task('pug-index', function() {
	return gulp.src([join(TEMPLATES, 'index.pug')])
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'pug-index',
					message: err.message
				}
			})
		}))
		.pipe(pug({
			compileDebug: false,
			pretty: true
		}))
		.pipe(gulp.dest(DEST));
});
