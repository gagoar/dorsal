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
                    stripBanners: true
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

        usebanner: {
            dist: {
                files: {
                    src: ['dist/<%= pkg.name %>.js']
                },
                options: {
                    position: 'top',
                    banner:  '/**\n' +
                             ' * @license\n' +
                             ' * Copyright 2014 Eventbrite\n' +
                             ' * Licensed under the Apache License, Version 2.0 (the "License");\n' +
                             ' * you may not use this file except in compliance with the License.\n' +
                             ' *\n' +
                             ' * You may obtain a copy of the License at\n' +
                             ' *     http://www.apache.org/licenses/LICENSE-2.0\n' +
                             ' *\n' +
                             ' * Unless required by applicable law or agreed to in writing, software\n' +
                             ' * distributed under the License is distributed on an "AS IS" BASIS,\n' +
                             ' * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n' +
                             ' * See the License for the specific language governing permissions and\n' +
                             ' * limitations under the License.\n' +
                             ' */\n\n' +
                             '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                }
            }
        },

        uglify: {
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= umd.dist.src %> ']
                },
                options: {
                    preserveComments: 'some'
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
                    keepRunner: true,
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
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('test', ['jasmine']);

    grunt.registerTask('default', [
        'clean',
        'test',
        'concat',
        'umd',
        'usebanner',
        'uglify'
    ]);
};
