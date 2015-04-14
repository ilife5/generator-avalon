'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs');
var path = require('path');
var os = require('os')

var widgetsMapping = {
  fekit: {
      oniui: {
        name: "oniui",
        version: "0.2.*"
      },
      request: {
        name: "avalonRequest",
        version: "*"
      },
      promise: {
        name: "avalonPromise",
        version: "*"
      },
      router: {
        name: "avalonRouter",
        version: "*"
      },
      animate: {
        name: "avalonAnimate",
        version: "*"
      }
    },
  bower: {
      oniui: {
        name: "oniui",
        version: "RubyLouvre/avalon.oniui"
      },
      request: {
        name: "mmRequest",
        version: "RubyLouvre/mmRequest"
      },
      promise: {
        name: "mmDeferred",
        version: "RubyLouvre/mmDeferred"
      },
      router: {
        name: "mmRouter",
        version: "RubyLouvre/mmRouter"
      },
      animate: {
        name: "mmAnimate",
        version: "RubyLouvre/mmAnimate"
      }
    }
};

var widgets = ["oniui", "request", "promise", "router", "animate"];
var components = ['datepicker', 'coupledatepicker', 'daterangepicker', 'at', 'carousel', 'checkboxlist', 'doublelist', 'flipswitch', 'loading','miniswitch', 'notice','pager', 'scrollbar', 'slider', 'smartgrid', 'simplegrid', 'spinner', 'switchdropdown', 'tab', 'menu', 'validation', 'dialog', 'textbox', 'button', 'dropdown', 'accordion']
var util = {
  generateForders: function() {
    var generator = this;
    ["src", "src/scripts", "src/styles", "src/scripts/filters", "src/scripts/layout", "src/scripts/pages", "src/scripts/ui",
    "src/scripts/util", "src/scripts/vendor", "src/styles/components", "src/styles/layout",
    "src/styles/pages", "src/styles/vendor"].forEach(function(path) {

      fs.exists(generator.destinationPath(path), function(exists) {
        if(exists) {
          generator.log(chalk.cyan("identical") + " " + path);
        } else {
          fs.mkdir(generator.destinationPath(path), function(err) {
            if(!err) {
              generator.log(chalk.green("   create") + " " + path);
            }
          });
        }
      })
    })
  }, config: function(widgetsMapping) {
    var config = this.fs.readJSON(this.templatePath('_' + this.packageConfig));
    this.widgets.forEach(function(name) {
      config.dependencies[widgetsMapping[name].name] = widgetsMapping[name].version;
    })
    config.name = this.appName;
    this.fs.write(this.destinationPath(this.packageConfig), JSON.stringify(config, undefined, 4));
  }
};


module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();
    var generator = this;
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the transcendent' + chalk.red('Avalon ') + ' generator!'
    ));

    var prompts = [
    {
      type: 'input',
      name: 'appName',
      message: 'What`s your app name?',
      default: this.destinationRoot().split(path.sep).pop()
    }, {
      type: 'list',
      name: 'packageManagement',
      message: 'Which package management you like to use?',
      default: "bower",
      choices: ["bower", "fekit"]
    }, { // yeoman 支持根据之前的user的答复来选择是否执行接下来的提问，具体是通过在when中添加判断返回是否执行此条prompt的标志，true为执行，false为跳过
      when: function(response) {
        if (response.packageManagement == 'bower' && !generator.options['skip-install']) {
          return true
        }
      },
      type: 'checkbox',
      name: 'oniComponents',
      message: 'Select oniui components',
      default: components,
      choices: components
    },{
      type: 'checkbox',
      name: 'widgets',
      message: 'Select widgets',
      default: widgets,
      choices: widgets
    }, {
        type: 'confirm',
        name: 'test',
        message: 'Do you need a robust testing framework?',
        default: false
      }];

    this.prompt(prompts, function (props) {
      this.packageManagement = props.packageManagement;
      this.appName = props.appName;
      this.widgets = props.widgets;
      this.test = props.test;
      this.oniComponents = props.oniComponents;
      if(this.packageManagement === "fekit") {
        this.packageConfig = "fekit.config"
      } else {
        this.packageConfig = this.packageManagement + ".json"
      }

      done();
    }.bind(this));
  },

  writing: {
    app: function () {

      //bower.json || fekit.config
      this.fs.copy(
        this.templatePath('_' + this.packageConfig),
        this.destinationPath(this.packageConfig)
      );
      //目录结构
      util.generateForders.call(this);

      //package.json
      var _packageJson = JSON.parse(this.fs.read(this.templatePath('_package.json')));
      _packageJson.name = this.appName;
      if(this.test) {
        _packageJson.scripts.test = "node_modules/elves/bin/elves";
        _packageJson.devDependencies.elves = "0.0.x";
      }
      this.fs.write(this.destinationPath("package.json"), JSON.stringify(_packageJson, undefined, 4));


      //for fekit package management
      if(this.packageManagement === "fekit") {

        //fekit.config
        util.config.call(this, widgetsMapping.fekit);

        //README
        this.fs.write(this.destinationPath("README.md"), "# " + this.appName + os.EOL + os.EOL + this.fs.read(this.templatePath("_README-fekit.md")));

        //encironment.yaml
        this.fs.copy(
          this.templatePath('_environment.yaml'),
          this.destinationPath('environment.yaml')
        );

        //build.sh
        this.fs.copy(
          this.templatePath('_build.sh'),
          this.destinationPath('build.sh')
        );
      } else {

        //bower.json
        util.config.call(this, widgetsMapping.bower);

         //README
        this.fs.write(this.destinationPath("README.md"), "# " + this.appName + os.EOL + os.EOL + this.fs.read(this.templatePath("_README-bower.md")));

      }
    }
  },

  install: function () {
    var generator = this
    if(this.packageManagement === "fekit") {

      //fekit install
      this.log( chalk.red("fekit install") );
      this.spawnCommand('fekit', ['install'])
    }

    this.installDependencies({
      skipInstall: this.options['skip-install'],
      callback: function() {
        if (generator.options["skip-install"]) {

          generator.log("Please finish the " + chalk.yellow.bold('npm install & bower install') + " manually, and if you had have the bower installation selected, then execute " + chalk.yellow.bold('yo avalon:oniui') + ' manually to finish the oniui packaging!');
        } else {

          var oniuiExists = fs.existsSync(generator.destinationPath('bower_components/oniui'));
          var bowerInstall = generator.packageManagement === "bower";

          if (bowerInstall && oniuiExists) {
            generator.log('bengin '+chalk.yellow('modules-cat nodejs ...'))

            var modulesCatProcess = generator.spawnCommand('modules-cat', ['nodejs', generator.destinationPath('bower_components/oniui/'), '-o', generator.destinationPath('bower_components/oniui_node/src/'), '-s']);
            modulesCatProcess.on('close', function() {
              generator.composeWith("avalon:oniui", {options: {oniuiComponents: generator.oniComponents, autoInstall: true}});
            })

          } else if (bowerInstall) {
            generator.log('something error has happened when excute bower installing or npm installing.')
            generator.log('Please execute '  + chalk.yellow.bold('npm install & bower install') + ' and then excute' + chalk.yellow.bold('yo avalon:oniui') + ' manually to finish the oniui packaging!');
          }
        }
      }.bind(this)
    });
  }
});
