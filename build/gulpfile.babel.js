import gulp from "gulp";
import uglifyJS from "gulp-uglify";
import gutil from "gulp-util";
import cleanCss from "gulp-clean-css";
import gulpBabel from "gulp-babel";

gulp.task('minify-css', () => {
  gulp.src('../static/css/*.css')
    .pipe(cleanCss())
    .on('error', (err) => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest('../static/css-min'));
});

gulp.task('babel-minify-js', () => {
  gulp.src('../static/js/*.js')
    .pipe(gulpBabel({
      presets: ['es2015']
    }))
    .pipe(uglifyJS())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest('../static/js-min'));
});


gulp.task('default', ['babel-minify-js', 'minify-css']);