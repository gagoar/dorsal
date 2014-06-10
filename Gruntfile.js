module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: ['dist/**/*']
        },

        concat: {
            dist: {
                src: [
                    'src/**/*.js'
                ],
                dest: 'dist/<%= pkg.name %>.js',
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n\n'
                }
            }
        },

        umd: {
            dist: {
                src: 'dist/<%= pkg.name %>.js',
                objectToExport: 'Dorsal',
                deps: {
                    default: []
                }
            }
        },

        uglify: {
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= umd.dist.src %> ']
                }
            }
        },

        watch: {
            files: [
                'src/**/*.js',
                'Gruntfile.js'
            ],
            tasks: ['default']
        },

        jasmine: {
            dorsal: {
                src: 'src/**/*.js',
                options: {
                    display: 'short',
                    summary: true,
                    specs: 'tests/*.js',
                    vendor: [
                        'node_modules/jquery/dist/jquery.js'
                    ],
                    helpers: [
                        'node_modules/jasmine-jquery/lib/jasmine-jquery.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-umd');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('default', [
        'clean',
        'jasmine',
        'concat',
        'umd',
        'uglify'
    ]);
};