// Require
const gulp = require("gulp");
const babel = require("gulp-babel");
const eslint = require("gulp-eslint");
const del = require("del");

// Config
const es_version = "es2017-node7";

// Lint
gulp.task("lint", () =>
    gulp.src(["./**/*.js", "!./node_modules/*", "!./.git/*"])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
);

// Build
gulp.task("build", () => {
    del.sync(["bin/"]);
    return gulp.series(() => {
        return gulp.src("./*.js")
            .pipe(babel({ presets: [es_version] }))
            .pipe(gulp.dest("bin/"));
    }, () => {
        return gulp.src("./modules/**/*.js")
            .pipe(babel({ presets: [es_version] }))
            .pipe(gulp.dest("bin/modules/"));
    }, () => {
        return gulp.src("./*.json")
            .pipe(gulp.dest("bin/"));
    });
});
