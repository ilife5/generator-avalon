var remapify = require('remapify')
var fs = require("fs")
var plugins = []
var pluginsDir = []
var initPluginFiles = false
var cssFiles = []
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    cssFiles: cssFiles,
    replace: {
      setAvalonPathRelative: {
        options: {
          patterns: [
          {
            match: /.*?require\("avalon"\).*;[\r\n]/g,
            replacement: ''
          }]
        },
        files: [{
          src: ['src/index.js'], 
          dest: "tmp/" ,
          filter: function(src) {
            var content = fs.readFileSync(src, {encoding: "utf8"})
            var regExP = /\/\*[\w\W]*?\*\/|\/\/[^\n]*[\n]*/g
            content = content.replace(regExP, "") // 移除所有被注释的组件
            content.replace(/require.*(avalon\.[a-z, A-Z]+)/g, function(match, pluginName) {
              var baseName = pluginName + ".js"
              if (!initPluginFiles) {
                var jsFiles = fs.readdirSync("src/")
                for(var i = 0, len = jsFiles.length; i < len; i++) {
                  var uiDirPath = "src/"+jsFiles[i]
                  if (fs.statSync(uiDirPath).isDirectory()) {
                    pluginsDir.push(uiDirPath)
                  }
                }
                initPluginFiles = true
              }
              for (var i = 0, len = pluginsDir.length; i < len; i++) {
                var pluginDir = pluginsDir[i]
                if (fs.readdirSync(pluginDir).indexOf(baseName) !== -1) {
                  plugins.push(pluginDir + "/" + baseName)
                }
              }
            })
            return src
          }
        }]
      },
      setPluginPathRelative: {
        options: {
          patterns: [
          {
            match: /.*?require\("avalon"\).*;[\r\n]/g,
            replacement: ''
          }, {
            match: /var.*require\("avalon"\).*,[\r\n]/g,
            replacement: 'var '
          }]
        },
        files: [{
          src: ['src/**/avalon*.js'], 
          dest: "tmp/"
        }]
      },
      removeCssCharset: {
        options: {
          patterns: [{
            match: /@charset "UTF-8";/,
            replacement: ""
          }]
        },
        files: [{
          src: ['<%= cssFiles %>', "src/chameleon/oniui-common.css"],
          dest: "tmp/"
        }]
      }
    },
    browserify: {
      pak: {
        options: {
          basedir: "./tmp/src",
          exclude: ["tmp/src/avalon.js"]//不将avalon打包进组件
        },
        files: {
          "release/oniui.js": ["tmp/src/index.js"]
        }
      }
    },
    concat: {
      oniuiCss: {
        src: ['tmp/src/chameleon/oniui-common.css', '<%= cssFiles %>'],
        dest: "release/oniui.css"
      },
      oniuiJs: {
        options: {
          separator: ";;"
        },
        src: ['src/avalon.js', 'release/oniui.js'],
        dest: "release/oniui.js"
      }
    },
    clean: ["tmp/**"],
    uglify: {
      minifyOnionJs: {
        files: {
          "release/oniui-min.js": "release/oniui.js"
        }
      }
    },
    cssmin: {
      minifyOnionCss: {
        files: {
          "release/oniui-min.css": "release/oniui.css"
        }
      }
    },
    watch: {
      files: ["./src/index.js"],
      tasks: ['browserify']
    }
  });
  grunt.registerTask("getCssFiles", "get the ui css files", function() {
    for (var i = 0, len = plugins.length; i < len; i++) {
      var plugin = plugins[i]
      var jsContent = fs.readFileSync(plugin, {encoding: "utf8"})
      cssFiles.push(plugin.replace(".js", ".css"))
      jsContent.replace(/require\([', "](.*avalon\.[a-z, A-Z]+)/g, function(match, str) {
        try {
          var path = fs.realpathSync(plugin.replace(/avalon\..*/, "") + str + ".css")
          path = path.replace(__dirname + "\\", "").replace(/\\/g, "/")
          if (cssFiles.indexOf(path) === -1) {
            cssFiles.push(path)
          }
        } catch(e) {

        }
      })
    }
  })
  grunt.registerTask("getConcatCssFiles", "get the transfered css files", function() {
    for (var i = 0, len = cssFiles.length; i < len; i++) {
      var cssFile = cssFiles[i]
      cssFiles[i] = "tmp/" + cssFile
    }
    console.log(cssFiles)
  })
  grunt.loadNpmTasks('grunt-replace');
  // 加载任务插件
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.file.setBase('./bower_components/oniui_node/')
  
  // 默认被执行的任务列表。
  // grunt.registerTask("log", ["replace:setAvalonPathRelative", "getCssFiles", "replace:removeCssCharset", "concat"])

  grunt.registerTask('oniuiJs', ['clean', 'replace:setAvalonPathRelative', "replace:setPluginPathRelative", 'browserify'])
  grunt.registerTask('oniuiCss', ["getCssFiles", "replace:removeCssCharset", "getConcatCssFiles", "concat:oniuiCss"])
  grunt.registerTask('concatAvalonAndOniui', ["concat:oniuiJs"])
  grunt.registerTask("minifyStatic", ["uglify", "cssmin"])

  grunt.registerTask('default', ["oniuiJs", "oniuiCss", "concatAvalonAndOniui", "minifyStatic"/*, "clean"*/]);
  // grunt.registerTask('default', ["oniuiJs", "oniuiCss", "minifyStatic"/*, "clean"*/]);
};