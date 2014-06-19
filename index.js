/**
 *  Nodeice
 *  =======
 *  Another PDF invoice generator
 *
 *  Written with love by Ionică Bizău <bizauionica@gmail.com> and licensed
 *  under the MIT license.
 *
 *  https://github.com/IonicaBizau/nodeice
 * */

// Dependencies
var Fs = require("fs")
  , Mustache = require("mustache")
  , Phantom = require("phantom")
  , Utils = require("jxutils")
  ;

/**
 * Invoice
 * This is the constructor that creates a new instance containing the needed
 * methods.
 *
 * @name Invoice
 * @function
 * @param {Object} options The options for creating the new invoice
 */
module.exports = function Invoice (options) {

    var self = this;

    /**
     * setOptions
     * Merges or resets the options.
     *
     * @name setOptions
     * @function
     * @param {Object} ops The options to be merged or set
     * @param {Boolean} reset If true, the options will be reset
     * @return {Invoice} The instance of Invoice
     */
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

    /**
     * convertMainToSecondary
     * Converts a currency into another currency according to the currency
     * balance provided in the options
     *
     * @name convertMainToSecondary
     * @function
     * @param {Number} input The number that should be converted
     * @return {Number} The converted input
     */
    self.convertMainToSecondary = function (input) {
        return input * options.data.currencyBalance.secondary
                / options.data.currencyBalance.main;
    };

    /**
     * renderAsHtml
     *
     * @name renderAsHtml
     * @function
     * @param {Object} ops An object containing the required field output - that
     * should be a string representing the path to the output that will store
     * the HTML code.
     * @param {Function} callback The callback function
     * @return {Invoice} The Invoice instance
     */
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

                // Convert buffers to string
                templateContent = templateContent.toString();
                rowBlockContent = rowBlockContent.toString();

                // Render table rows
                for (var i = 0, cTask; i < tasks.length; ++i) {

                    // Clone the current task
                    cTask = Utils.cloneObject(tasks[i]);

                    // Set the additional fields and compute data
                    cTask.nrCrt = i + 1;
                    if (typeof cTask.unitPrice === "number") {
                        cTask.unitPrice = {
                            main: cTask.unitPrice
                          , secondary: self.convertMainToSecondary(
                                cTask.unitPrice
                            )
                        }
                    }

                    // Set the unit price of this row
                    cTask.unitPrice.main = cTask.unitPrice.main.toFixed(2);
                    cTask.unitPrice.secondary =
                        cTask.unitPrice.secondary.toFixed(2);

                    // Build amount object
                    cTask.amount = {
                        main: cTask.unitPrice.main * cTask.quantity
                      , secondary: cTask.unitPrice.secondary * cTask.quantity
                    };

                    // Sum the amount to the total
                    invoiceData.total.main += cTask.amount.main;
                    invoiceData.total.secondary += cTask.amount.secondary;

                    // Set the amount of this row
                    cTask.amount.main = cTask.amount.main.toFixed(2);
                    cTask.amount.secondary = cTask.amount.secondary.toFixed(2);

                    // Render HTML for the current row
                    invoiceData.description_rows += Mustache.render(
                        rowBlockContent, cTask
                    );
                }

                // Set the total
                invoiceData.total.main  = invoiceData.total.main.toFixed(2);
                invoiceData.total.secondary =
                    invoiceData.total.secondary.toFixed(2);

                // Render the invoice HTML fields
                var invoiceHtml = Mustache.render(templateContent, invoiceData);

                // Output file
                if (typeof ops.output === "string") {
                    Fs.writeFile(ops.output, invoiceHtml, function (err, data) {
                        callback(err, invoiceHtml);
                    });
                    return;
                }

                // Callback the data
                callback(null, invoiceHtml);
            });
        });
        return self;
    };

    /**
     * renderAsPdf
     * Renders invoice as pdf
     *
     * @name renderAsPdf
     * @function
     * @param {Object} options An object containing the `output` field
     * represeting the path to the pdf file that will be created.
     * @param {Function} callback The callback function
     * @return {Invoice} The Invoice instance
     */
    self.renderAsPdf = function (options, callback) {

        var tmpFileName = __dirname + "/tmp-invoice.html";

        // First, render the invoice as pdf
        self.renderAsHtml({
            output: tmpFileName
        }, function (err) {
            if (err) { return callback(err); }
            Phantom.create(function (ph) {
                ph.createPage(function (page) {
                    page.set("viewportSize", { width: 2480, height: 3508 });
                    page.open(tmpFileName, function(status) {
                        page.render(options.output, function() {
                            Fs.unlink(tmpFileName);
                            ph.exit();
                            callback.call(this, arguments);
                        });
                    });
                });
            });
        });

        return self;
    };
};
