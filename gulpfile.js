// Require
const gulp = require("gulp");
const babel = require("gulp-babel");
const eslint = require("gulp-eslint");
const del = require("del");

// Config
const es_version = "es2017-node7";

// Lint
gulp.task("lint", () =>
    gulp.src(["./*.js", "./modules/**/*.js"])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
);

// Build
gulp.task("build", () => {
    del.sync(["bin/"]);
    gulp.src("./*.js")
        .pipe(babel({ presets: [es_version] }))
        .pipe(gulp.dest("bin/"));
    gulp.src("./modules/**/*.js")
        .pipe(babel({ presets: [es_version] }))
        .pipe(gulp.dest("bin/modules/"));
    return gulp.src(["./**/*.*", "!./node_modules/**/*", "!./.git/*", "!./**/*.js"])
        .pipe(gulp.dest("bin/"));
});
