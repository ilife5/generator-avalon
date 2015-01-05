'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');

describe('avalon:app bower', function () {
  this.timeout(10000);
  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(os.tmpdir(), './temp-test'))
      .withPrompt({
        packageManagement: "bower",
        appName: "avalon_yo"
      }).on('end', done);

    setTimeout(done, 9000)
  });

  it('creates files', function () {
    assert.file([
      'bower.json'
    ]);
  });
});
