module.exports = ->
  @registerTask 'default', ['concat', 'uglify']

  @initConfig
    concat:
      'static/js/bundle.js': do ->
        ('static/js/' + file + '.js') for file in [
          'jquery-1.10.2'
          'lodash'
          'rtc'
          'shim'
          'init'
          'connection'
        ]

    uglify:
      'static/js/bundle.min.js': 'static/js/bundle.js'

    watch:
      js:
        files: ['static/js/*', '!static/js/bundle*']
        tasks: ['default']

  @loadNpmTasks(task) for task in require('matchdep').filterDev('grunt-*')
