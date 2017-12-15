var gulp = require('gulp'),
		path = require('path'),
		pug = require('gulp-pug'),
		less = require('gulp-less'),
		autoPrefixer = require('autoprefixer'),
		minify = require('cssnano'),
		sourceMaps = require('gulp-sourcemaps'),
		concat = require('gulp-concat'),
		plumber = require('gulp-plumber'),
		notify = require('gulp-notify'),
		util = require('gulp-util'),
		uglify = require('gulp-uglify'),
		postCss = require('gulp-postcss'),
		imageMin = require('imagemin'),
		browserSync = require('browser-sync').create(),
		rollup = require('gulp-rollup'),
		babel = require('rollup-plugin-babel'),
		useref = require('gulp-useref'),
		runSequence = require('run-sequence'),
		webpack = require('webpack-stream'),
		del = require('del'),
		argv   = require('minimist')(process.argv);
		gulpif = require('gulp-if');
		prompt = require('gulp-prompt');
		rsync  = require('gulp-rsync');
		join = path.join;


var DEST = 'out',
		SRC = 'src',
		TEMPLATES = join(SRC, 'templates'),
		STYLES = join(SRC, 'styles'),
		SCRIPTS = join(SRC, 'scripts');
		IMAGES = join(SRC, 'images');


gulp.task('less', function() {

	var processors = [
		autoPrefixer({browsers: ['last 2 versions']}),
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
		.pipe(sourceMaps.init())
		.pipe(less())
		.pipe(postCss(processors))
		.pipe(concat('styles.css'))
		.pipe(sourceMaps.write())
		.pipe(gulp.dest(join(DEST, 'styles')));
});


gulp.task('images', function(){
	return gulp.src(join(IMAGES, '**/*.+(png|jpg|jpeg|gif|svg)'))
	.pipe(cache(imageMin({
			interlaced: true
		})))
	.pipe(gulp.dest(join(DEST, 'images')));
});


gulp.task('pug-index', function() {
	return gulp.src([join(TEMPLATES, '*.pug')])
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


gulp.task('js', function() {

	return gulp.src(join(SCRIPTS, '*.js'))
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: "JS",
					message: err.message
				}
			})
		}))
		.pipe(sourceMaps.init())
		.pipe(webpack({
			output: {
				filename: 'bundle.js',
			},
		}))
		// .pipe(uglify())
		.pipe(sourceMaps.write())
		.pipe(gulp.dest(join(DEST, 'scripts')));
});


gulp.task('clean:dist', function() {
	return del.sync(DEST);
});


gulp.task('pug-index:sync', ['pug-index'], function(done) {
	browserSync.reload();
	done();
});


gulp.task('less:sync', ['less'], function(done) {
	browserSync.reload();
	done();
});


gulp.task('js:sync', ['js'], function(done) {
	browserSync.reload();
	done();
});


gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: './out'
		},
	})
	gulp.watch(join(TEMPLATES, '**/*.pug'), ['pug-index:sync']);
	gulp.watch(join(STYLES, '**/*.less'), ['less:sync']);
	gulp.watch(join(SCRIPTS, '**/*.js'), ['js:sync']);
	gulp.watch(join(SRC, 'img/*'), ['images']);
})


gulp.task('watch', ['browserSync'], function() {
	gulp.watch(join(TEMPLATES, '**/*.pug'), ['pug-index']);
	gulp.watch(join(STYLES, '**/*.less'), ['less']);
	gulp.watch(join(SCRIPTS, '**/*.js'), ['js']);
	gulp.watch(join(SRC, 'images/*'), ['images']);
})


gulp.task('build', function (callback) {
	runSequence('clean:dist',
		['pug-index', 'less', 'js', 'images'],
		callback
	)
})

gulp.task('deploy', function() {
	gulp.src(DEST)
		.pipe(rsync({
			hostname: '77.222.40.32',
			username: 'nordwestru',
			destination: 'test/public_html/',
			progress: true,
			incremental: true,
			relative: true,
			emptyDirectories: true,
			recursive: true,
			clean: true,
			exclude: [],
		}));
});
