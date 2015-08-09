var gulp = require('gulp');
var webpack = require('webpack-stream');
var uglify = require('gulp-uglify');

gulp.task('default', function() {
	return gulp.src('./app.js')
		.pipe(webpack({
			watch: true,
			output: {
				filename: 'build.js',
			}
		}))
		// .pipe(uglify())
		.pipe(gulp.dest('dist/'));
});