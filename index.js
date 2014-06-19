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

    self.convertMainToSecondary = function (input) {
        return input * options.data.currencyBalance.secondary / options.data.currencyBalance.main;
    };

    self.renderAsHtml = function (ops, callback) {

        var template = ops.template || options.config.template
          , path = ops.path || options.config.path
          , tableRowBlock = ops.tableRowBlock || options.config.tableRowBlock
          , tasks = ops.tasks || options.data.tasks
          , invoiceData = {
                seller: options.seller
              , buyer: options.buyer
              , invoice: options.data.invoice
              , description_rows: ""
              , total: {
                    main: 0
                  , secondary: 0
                }
            }
          ;

        // Read template
        Fs.readFile(template, function (err, templateContent) {

            // Read row block
            Fs.readFile(tableRowBlock, function (err, rowBlockContent) {

                templateContent = templateContent.toString();
                rowBlockContent = rowBlockContent.toString();

                // Render table rows
                for (var i = 0, cTask; i < tasks.length; ++i) {
                    cTask = tasks[i];
                    cTask.nrCrt = i + 1;
                    if (typeof cTask.unitPrice === "number") {
                        cTask.unitPrice = {
                            main: cTask.unitPrice
                          , secondary: self.convertMainToSecondary(cTask.unitPrice)
                        }
                    }

                    cTask.unitPrice.main = cTask.unitPrice.main.toFixed(2);
                    cTask.unitPrice.secondary = cTask.unitPrice.secondary.toFixed(2);

                    cTask.amount = {
                        main: cTask.unitPrice.main * cTask.quantity
                      , secondary: cTask.unitPrice.secondary * cTask.quantity
                    };

                    invoiceData.total.main += cTask.amount.main;
                    invoiceData.total.secondary += cTask.amount.secondary;

                    cTask.amount.main = cTask.amount.main.toFixed(2);
                    cTask.amount.secondary = cTask.amount.secondary.toFixed(2);

                    invoiceData.description_rows += Mustache.render(rowBlockContent, cTask);
                }

                invoiceData.total.main  = invoiceData.total.main.toFixed(2);
                invoiceData.total.secondary = invoiceData.total.secondary.toFixed(2);

                var invoiceHtml = Mustache.render(templateContent, invoiceData);

                // Output file
                if (typeof ops.output === "string") {
                    Fs.writeFile(ops.output, invoiceHtml, function (err, data) {
                        callback(err, invoiceHtml);
                    });
                    return self;
                }

                callback(null, invoiceHtml);
            });
        });
    };
};
