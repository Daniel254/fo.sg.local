var gpath = "/Users/I/AppData/Roaming/npm/node_modules/";

var json = require('./package.json');

var //lr = require('tiny-lr'), // Минивебсервер для livereload
    gulp = require('gulp'), // Сообственно Gulp JS
    notify = require(gpath+'gulp-notify'),
    plumber = require(gpath+'gulp-plumber'), // Предотвращает прерываение выполнения при ошибках
    imagemin = require(gpath+'gulp-imagemin'), // Минификация изображений
    minifyCSS = require(gpath+'gulp-minify-css'), // Минификация CSS
    connect = require(gpath+'gulp-connect'), 
    watch = require(gpath+'gulp-watch'),
    combine = require(gpath+'stream-combiner'), 
    cache = require(gpath+'gulp-cache'),
    filter = require(gpath+'gulp-filter'),      
    ftp = require(gpath+'gulp-ftp'), 
    prefix = require(gpath+'gulp-autoprefixer');
      
// Переменные путей
    var paths = {  
      src_css: ['./src/css/*.css'],
      css: ['./www/assets/css/*.css'],
      html: ['www/*.html']
    };

// LiveReload CSS
    gulp.task('css', function(done) {
      gulp.src(paths.src_css)
        //.pipe(plumber())
        .pipe(prefix('last 2 version', 'ie 8', 'ie 9', 'ie 10', 'android 4', 'firefox >= 20', 'safari 5', 'ios 6', { cascade: true }))  
        .pipe(gulp.dest('www/assets/css'))
        .pipe(connect.reload())
        .on('end', done);
    });
     
// LiveReload HTML
    gulp.task('html', function(done) {
      gulp.src(paths.html)
        .pipe(connect.reload())
        .on('end', done);
    });

//Server
    gulp.task('server', function(){
      connect.server({
        root: ['www'],
        port: 9000,
        livereload: true,
        middleware: function(connect, o) {
          return [ (function() {
              var url = require('url');
              var proxy = require(gpath+'proxy-middleware');
              var options = url.parse('http://'+json.name+'/');
              return proxy(options);
          })() ];
        }
      });
    });

    // gulp.task('sprite', function() {
    //     var spriteData = 
    //         gulp.src('./src/sprite/*.*') // путь, откуда берем картинки для спрайта
    //             .pipe(spritesmith({
    //                 imgName: 'sprite.png',
    //                 cssName: 'sprite.css',
    //             }));

    //     spriteData.img.pipe(gulp.dest('./www/assets/img/')); // путь, куда сохраняем картинку
    //     spriteData.css.pipe(gulp.dest('./src/css/')); // путь, куда сохраняем стили
    // });

// Минификация изображение и CSS
    gulp.task('min', function() {
        gulp.src('www/assets/css/*.css').pipe(minifyCSS()).pipe(gulp.dest('www/assets/css'));
        gulp.src('www/assets/img/*').pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })).pipe(gulp.dest('www/assets/img'));
    });

// Минификация всех изображений [При старте]
//    gulp.task('copyimgmin', function() {
//        gulp.src('src/img/*')
//          .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
//          .pipe(gulp.dest('www/assets/img'));
//    });       
    
//Минификация всех inline изображений [При старте]
//    gulp.task('inlinemin', function() {
//        gulp.src('src/img/inline/*')
//          .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
//          .pipe(gulp.dest('src/img/inline/*'));
//    }); 


// Следим за папкой img. При добавлении нового файла минимизируем его в assets/img           //TODO: Переименовывать изображения в конечной папке при переименовании в сорцах
//watch({glob: 'src/img/*' })
//        .pipe(plumber())
//        .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
//        .pipe(gulp.dest('www/assets/img'));

// Следим за папкой inline. При добавлении нового файла минимизируем его здесь же
// watch({glob: 'src/img/inline/*' })
//         .pipe(plumber())
//         .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
//         .pipe(gulp.dest('src/img/inline'));


   
                                            
gulp.task('imagesmin', function() {
  return gulp.src('src/img/*.*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('www/assets/img'));
});

gulp.task('inlinemin', function(done) {
    gulp.src('src/img/inline/*.*')
      .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
      .pipe(gulp.dest('src/img/inline'))
      .on('end', done);
}); 

//FTP
gulp.task('ftp', function () {
    return gulp.src('www/assets/css/*.css')
        .pipe(connect.reload())
        .pipe(cache(ftp({
            host: 'lsp13.b.ls1.ru',
            user: 'x05inprogressru',
            pass: '0zIxG6VS',
            remotePath: 'www/assets/css'
        })));
});

//Watch ftp
gulp.task('watch-ftp', function() {
    gulp.watch(paths.src_css, ['css']); 
    gulp.watch(paths.css, ['ftp']); 
    //gulp.watch(paths.html, ['html']);
    //gulp.watch('src/img/*', ['imagesmin']);
   // gulp.watch('src/img/inline/*', ['inlinemin']);
    
    //gulp.watch(['dist/**']).on('change', livereload.changed);
});


// Watch
gulp.task('watch', function() {
    gulp.watch(paths.src_css, ['css']);
    gulp.watch(paths.html, ['html']);
    gulp.watch('src/img/*', ['imagesmin']);
    gulp.watch('src/img/inline/*', ['inlinemin']);
    
    //gulp.watch(['dist/**']).on('change', livereload.changed);
});



//gulp.task('default', ['clean'], function() {
//    gulp.start('images');
//});

gulp.task('default', ['server', 'imagesmin', 'inlinemin', 'watch']);