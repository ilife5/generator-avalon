'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');

describe('avalon:app bower', function () {
  this.timeout(20000);
  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(os.tmpdir(), './temp-test'))
      .withPrompt({
        packageManagement: "bower",
        appName: "avalon_yo"
      }).on('end', done);
  });

  it('creates files', function () {
    assert.file([
      'bower.json',
      'package.json'
    ]);
    console.log("done");
  });
});
