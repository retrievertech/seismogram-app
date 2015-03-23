var gulp = require('gulp');
var concat = require('gulp-concat');

var paths = {
  services: ['./src/services/*.js'],
  controllers: ['./src/controllers/*.js'],
  directives: ['./src/directives/*.js']
};

gulp.task('build-js', function() {
  gulp.src(paths.services)
    .pipe(concat('services.js'))
    .pipe(gulp.dest('./js'));

  gulp.src(paths.controllers)
    .pipe(concat('controllers.js'))
    .pipe(gulp.dest('./js'));

  gulp.src(paths.directives)
    .pipe(concat('directives.js'))
    .pipe(gulp.dest('./js'));
});

gulp.task('watch-js', function() {
  gulp.watch(paths.services.concat(paths.controllers).concat(paths.directives), ['build-js']);
});

gulp.task('watch', [ 'watch-js' ]);

gulp.task('build', [ 'build-js' ]);