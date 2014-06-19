var Fs = require("fs")
  , Mustache = require("mustache")
  ;

module.exports = function Invoice (options) {

    var self = this;

    self.setOptions = function (ops, reset) {

        if (reset) {
            options = ops;
            return self;
        }

        for (var key in ops) {
            options[key] = ops[key] || options[key];
        }
        return self;
    };

    self.renderAsHtml = function (ops, callback) {

        var template = ops.template || options.config.template
          , path = ops.path || options.config.path
          , tableRowBlock = ops.tableRowBlock || options.config.tableRowBlock
          , tasks = ops.tasks || options.data.tasks
          ;

        Fs.readFile(template, function (err, templateContent) {
            Fs.readFile(tableRowBlock, function (err, tableBlockContent) {
                for (var i = 0, cTask; i < tasks.length; ++i) {
                    cTask = tasks[i];
                }
            });
        });
    };
};
