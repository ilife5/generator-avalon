'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var rimraf = require('rimraf');
var chalk = require('chalk');

function copyDirs(generator) {
  var oniuiNodePath = generator.destinationPath('bower_components/oniui_node/release/');
  var oniuiPath = generator.destinationPath('bower_components/oniui/');
  /* 在使用writeFile方法时，因为oniui目录并没有创建，而node并不会自己创建目录，所以总是报错，也就是说writeFile可以保证在文件不存在的时候创建文件，但是目录也不存在那就没法正常运行 */
  generator.mkdir('bower_components/oniui');

  fs.readdir(oniuiNodePath, function(err, files) {
    if (!err) {
      for (var i = 0, len = files.length; i < len; i++) {
        var fileName = files[i];
        var filePath = oniuiPath + fileName;
        var tmpPath = oniuiNodePath + fileName;
        var content = fs.readFileSync(tmpPath, {encoding: 'utf8'});

        fs.writeFileSync(filePath, content, {encoding: 'utf8'});
        generator.log("File "+ filePath + ' created !');
      }
    }
  })
}

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.argument('name', {
      required: false,
      type: String,
      desc: 'The subgenerator name'
    });
  },

  prompting: function() {
    if (!this.options.autoInstall) {
      var done = this.async();
      var components = ['datepicker', 'coupledatepicker', 'daterangepicker', 'at', 'carousel', 'checkboxlist', 'doublelist', 'flipswitch', 'loading','miniswitch', 'notice','pager', 'scrollbar', 'slider', 'smartgrid', 'simplegrid', 'spinner', 'switchdropdown', 'tab', 'menu', 'validation', 'dialog', 'textbox', 'button', 'dropdown', 'accordion'];
      var prompts = [{
        type: 'checkbox',
        name: 'oniComponents',
        message: 'Select oniui components',
        default: components,
        choices: components
      }];

      this.prompt(prompts, function (props) {
        this.options.oniuiComponents = props.oniComponents;
        
        done();
      }.bind(this));
    }
  },

  installOniuiAndTransferToCmd: function() {
    var generator = this;
    
    if (!this.options.autoInstall) {
      var done = this.async();

      var modulesCatProcess = generator.spawnCommand('modules-cat', ['nodejs', generator.destinationPath('bower_components/oniui/'), '-o', generator.destinationPath('bower_components/oniui_node/src/'), '-s']);

      modulesCatProcess.on('close', function() {
        generator.log("modules-cat execute Ok")
        done()
      })
    }
  },

  writFile: function () {
    this.fs.copy(
      this.templatePath('_Gruntfile.js'),
      this.destinationPath('Gruntfile.js')
    );
    this.fs.copy(
      this.templatePath('demo.html'),
      this.destinationPath('bower_components/oniui_node/release/demo.html')
    )

  },

  createOniuiIndexJs: function() {
    var generator = this;
    var oniuiComponents = this.options.oniuiComponents;
    var indexContent = "";

    for (var i = 0, len = oniuiComponents.length; i < len; i++) {
      var component = oniuiComponents[i];
      var componentDir = component;
      switch(component) {
        case "daterangepicker":
          componentDir = "datepicker";
        break;
        case "coupledatepicker":
          componentDir = "datepicker";
        break;
      }
      indexContent += 'require("./' + componentDir + '/avalon.' + component + '.js")\n'
    }
    fs.writeFileSync(this.destinationPath('bower_components/oniui_node/src/index.js'), indexContent, {encoding: "utf8"})
  },

  execGruntfileAndPackageOniui: function() {
    var generator = this;

    rimraf(generator.destinationPath('bower_components/oniui'), function(err) {

      if (!err) {
        generator.log('begin run grunt ...');
        var gruntProcess = generator.spawnCommand('grunt');

        gruntProcess.on('close', function() {
          generator.log('grunt complete!');

          copyDirs(generator);
          
          rimraf(generator.destinationPath('bower_components/oniui_node'), function(err) {
            if (err) {
              grunt.log('Please excute ' + chalk.yellow.bold('rm -rf bower_components/oniui_node') + ' yourself.')
            }
          })
        })
      } else {
        generator.log('something error has happened, please excute ' + chalk.yellow.bold('yo avalon:oniui') + ' again.')
      }
    })
  }
});
