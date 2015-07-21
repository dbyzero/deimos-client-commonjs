var gulp = require('gulp');
var webpack = require('webpack-stream');

gulp.task('default', function() {
	return gulp.src('./app.js')
		.pipe(webpack({
			watch: true}))
		.pipe(gulp.dest('dist/'));
});