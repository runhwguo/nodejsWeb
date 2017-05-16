import gulp from "gulp";
import uglifyJS from "gulp-uglify";
import cleanCss from "gulp-clean-css";
import minHtml from "gulp-htmlmin";
import minImage from "gulp-imagemin";
import gutil from "gulp-util";
import gulpBabel from "gulp-babel";
import cache from "gulp-cache";

gulp.task('min-html', () => {
  gulp.src('../view/**/*.html')
    .pipe(cache(minHtml({
      removeComments: true,//清除HTML注释
      collapseWhitespace: true,//压缩HTML
      minifyJS: true,//压缩页面JS
      minifyCSS: true//压缩页面CSS
    })))
    .on('error', err => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest('../dist/view'));
});

gulp.task('clean-css', () => {
  gulp.src('../static/css/**/*.css')
    .pipe(cache(cleanCss()))
    .pipe(gulp.dest('../dist/css'))
    .on('error', err => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    });
});

gulp.task('babel-minify-js', () => {
  gulp.src('../static/js/**/*.js')
    .pipe(cache(gulpBabel({
      presets: ['es2015']
    })))
    .pipe(cache(uglifyJS()))
    .on('error', err => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest('../dist/js'));
});

gulp.task('min-image', () => {
  gulp.src('../static/image/*')
    .pipe(cache(minImage([
      minImage.gifsicle({interlaced: true}),
      minImage.jpegtran({progressive: true}),
      minImage.optipng({optimizationLevel: 5}),
      minImage.svgo({plugins: [{removeViewBox: true}]})
    ]), {
      verbose: true
    }))
    .on('error', err => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest('../dist/image'))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    });
});

gulp.task('default', ['min-html', 'clean-css', 'babel-minify-js', 'min-image']);