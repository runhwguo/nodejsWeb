import gulp from "gulp";
import uglifyJS from "gulp-uglify";
import cleanCss from "gulp-clean-css";
import minHtml from "gulp-htmlmin";
import gutil from "gulp-util";
import gulpBabel from "gulp-babel";


gulp.task('min-html', () => {
  gulp.src('../view/**/*.html')
    .pipe(minHtml({
      removeComments: true,//清除HTML注释
      collapseWhitespace: true,//压缩HTML
      minifyJS: true,//压缩页面JS
      minifyCSS: true//压缩页面CSS
    }))
    .on('error', (err) => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest('../view-min'));
});

gulp.task('clean-css', () => {
  gulp.src('../static/css/**/*.css')
    .pipe(cleanCss())
    .on('error', (err) => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest('../static/css-min'));
});

gulp.task('babel-minify-js', () => {
  gulp.src('../static/js/**/*.js')
    .pipe(gulpBabel({
      presets: ['es2015']
    }))
    .pipe(uglifyJS())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest('../static/js-min'));
});

gulp.task('default', ['min-html', 'clean-css', 'babel-minify-js']);