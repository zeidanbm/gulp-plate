const { src, dest } = require('gulp');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const sourcemaps = require('gulp-sourcemaps');
const handleErrors = require('../util/handleErrors');
const config = require('../config').scss;
const postcss = require('gulp-postcss');
const gulpif = require('gulp-if');
const nano = require('cssnano');
const autoprefixer = require('autoprefixer');
const importer = require('postcss-import');
const removeClasses = require('../util/removeCssClasses')(config.remove);

const procesors = [importer, removeClasses, autoprefixer()];

function scss() {
  const isProd = global.env === 'prod';
  if (isProd) {
    procesors.push(nano(config.compression));
  }

  return (
    src(config.src)
      // Linting
      .pipe(sassLint())
      .pipe(sassLint.format())
      .pipe(sassLint.failOnError())
      .on('error', handleErrors)

      // Sourcemaps if not prod
      .pipe(gulpif(!isProd, sourcemaps.init()))

      // Copilation
      .pipe(sass(config.options))
      .on('error', handleErrors)

      // Post processing
      .pipe(postcss(procesors))

      // Sourcemaps if not prod
      .pipe(gulpif(!isProd, sourcemaps.write()))

      // Dest & reloading
      .pipe(dest(config.dest))
      .pipe(gulpif(!isProd, browserSync.reload({ stream: true })))
  );
}

module.exports = scss;
