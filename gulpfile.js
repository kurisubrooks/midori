// Require
const gulp = require("gulp");
const babel = require("gulp-babel");
const eslint = require("gulp-eslint");
const del = require("del");

// Config
const es_version = "es2017-node7";

// Lint
gulp.task("lint", () =>
    gulp.src(["./*.js", "./core/**/*.js", "./commands/**/*.js", "./subprocesses/**/*.js"])
        .pipe(eslint())
        .pipe(eslint.format())
);

// Build
gulp.task("build", () => {
    del.sync(["bin/"]);
    gulp.src("./*.js")
        .pipe(babel({ presets: [es_version] }))
        .pipe(gulp.dest("bin/"));
    gulp.src("./core/**/*.js")
        .pipe(babel({ presets: [es_version] }))
        .pipe(gulp.dest("bin/core/"));
    gulp.src("./commands/**/*.js")
        .pipe(babel({ presets: [es_version] }))
        .pipe(gulp.dest("bin/commands/"));
    gulp.src("./subprocesses/**/*.js")
        .pipe(babel({ presets: [es_version] }))
        .pipe(gulp.dest("bin/subprocesses/"));
    return gulp.src(["./**/*.*", "!./node_modules/**/*", "!./.git/*", "!./**/*.js"])
        .pipe(gulp.dest("bin/"));
});
