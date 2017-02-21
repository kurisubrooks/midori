// Require
const gulp = require("gulp");
const eslint = require("gulp-eslint");

// Lint
gulp.task("lint", () =>
    gulp.src(["./*.js", "./core/**/*.js", "./commands/**/*.js", "./subprocesses/**/*.js"])
        .pipe(eslint())
        .pipe(eslint.format())
);
