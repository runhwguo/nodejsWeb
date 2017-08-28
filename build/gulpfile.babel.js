import gulp from 'gulp';
import uglifyJS from 'gulp-uglify';
import cleanCss from 'gulp-clean-css';
import minHtml from 'gulp-htmlmin';
import minImage from 'gulp-imagemin';
import gutil from 'gulp-util';
import gulpBabel from 'gulp-babel';
import cache from 'gulp-cache';
import eslint from 'gulp-eslint';
import Path from 'path';

const DEST_DIR   = Path.join('..', 'dist'),
      STATIC_DIR = Path.join('..', 'static'),
      VIEW_DIR   = 'view';

gulp.task('min-html', () => {
  // gulp.src('../view/**/*.html')
  gulp.src(Path.join('..', VIEW_DIR, '**', '*.html'))
    .pipe(cache(minHtml({
      removeComments: true,//清除HTML注释
      collapseWhitespace: true,//压缩HTML
      minifyJS: true,//压缩页面JS
      minifyCSS: true//压缩页面CSS
    })))
    .on('error', err => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest(Path.join(DEST_DIR, VIEW_DIR)));
});

gulp.task('clean-css', () => {
  // gulp.src('../static/css/**/*.css')
  gulp.src(Path.join(STATIC_DIR, 'css', '**', '*.css'))
    .pipe(cache(cleanCss()))
    .pipe(gulp.dest(Path.join(DEST_DIR, 'css')))
    .on('error', err => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    });
});

gulp.task('lint', () => {
  return gulp.src(['../src/**/**/*.js', '../static/js/**/*.js', '!node_modules/**'])
    .pipe(eslint({
      env: {
        browser: true,
        commonjs: true,
        es6: true,
        es7: true,
        node: true
      },
      extends: 'eslint:recommended',
      parserOptions: {
        sourceType: 'module'
      },
      rules: {
        indent: [
          'warn',
          2,
          {
            VariableDeclarator: {
              var: 2,
              let: 2,
              const: 3
            },
            SwitchCase: 1
          }
        ],
        'linebreak-style': [
          'error',
          'unix'
        ],
        quotes: [
          'warn',
          'single'
        ],
        semi: [
          'error',
          'always'
        ]
      },
      parser: 'babel-eslint'
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
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
  // gulp.src('../static/image/*')
  gulp.src(Path.join(STATIC_DIR, 'image', '*'))
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
    .pipe(gulp.dest(Path.join(DEST_DIR, 'image')))
    .on('error', err => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    });
});

gulp.task('copy', () => {
  gulp.src(Path.join(STATIC_DIR, 'font', '*'))
    .pipe(gulp.dest(Path.join(DEST_DIR, 'font')))
    .on('error', err => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    });

  gulp.src(Path.join(STATIC_DIR, 'libs', '**', '*'))
    .pipe(gulp.dest(Path.join(DEST_DIR, 'libs')))
    .on('error', err => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    });
});

gulp.task('default', ['min-html', 'clean-css', 'lint', 'babel-minify-js', 'min-image', 'copy']);