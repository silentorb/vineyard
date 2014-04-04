module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-ts')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-text-replace')

  grunt.initConfig({
    ts: {
      vineyard: {                                 // a particular target
        src: ["lib/Vineyard.ts"],        // The source typescript files, http://gruntjs.com/configuring-tasks#files
        out: 'vineyard.js',                // If specified, generate an out.js file which is the merged js file
        options: {                    // use to override the default options, http://gruntjs.com/configuring-tasks#options
          target: 'es5',            // 'es3' (default) | 'es5'
          module: 'commonjs',       // 'amd' (default) | 'commonjs'
          declaration: true,       // true | false  (default)
          verbose: true
        }
      }
    },
    concat: {
      options: {
        separator: ''
      },
      vineyard: {
        src: [
          'lib/vineyard_header.js',
          'vineyard.js',
          'lib/vineyard_footer.js'
        ],
        dest: 'vineyard.js'
      },
      "vineyard-def": {
        src: [
          'vineyard.d.ts',
          'lib/vineyard_definition_footer'
        ],
        dest: 'vineyard.d.ts'
      }
    },
    replace: {
      "vineyard-def": {
        src: ["vineyard.d.ts"],
        overwrite: true,
        replacements: [
          {
            from: 'defs/',
            to: ""
          }
        ]
      }
    },
    watch: {
       vineyard: {
        files: 'lib/**/*.ts',
        tasks: ['default']
      }
    }
  })

  grunt.registerTask('default', ['ts:vineyard', 'concat:vineyard', 'concat:vineyard-def']);

}