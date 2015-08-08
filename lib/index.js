// Dependencies
var Fs = require("fs")
  , ReadUtf8 = require("read-utf8")
  , Mustache = require("mustache")
  , Phantom = require("phantom-render-stream")
  , SameTime = require("same-time")
  , OneByOne = require("one-by-one")
  , IterateObject = require("iterate-object")
  , Events = require("events")
  , EventEmitter = Events.EventEmitter
  , Ul = require("ul")
  , HtmlPdf = require("html-pdf")
  , Typpy = require("typpy")
  , IsStream = require("is-stream")
  ;

/**
 * Invoice
 * This is the constructor that creates a new instance containing the needed
 * methods.
 *
 * @name Invoice
 * @function
 * @param {Object} options The options for creating the new invoice:
 *
 *  - `config` (Object):
 *    - `template` (String): The HTML root template.
 *    - `tableRowBlock` (String): The row block HTML template.
 *  - `data` (Object):
 *    - `currencyBalance` (Object):
 *      - `main` (Number): The main balance.
 *      - `secondary` (Number): The converted main balance.
 *      - `tasks` (Array): An array with the tasks (description of the services you did).
 *      - `invoice` (Object): Information about invoice.
 *  - `seller` (Object): Information about seller.
 *  - `buyer` (Object): Information about buyer.
 */
function NodeIce(options) {
    this.options = options;
    this.templates = {};
}

/**
 * initTemplates
 * Inits the HTML templates.
 *
 * @name initTemplates
 * @function
 * @param {Function} callback The callback function.
 */
NodeIce.prototype.initTemplates = function (callback) {
    var self = this;
    if (self.templates.root === undefined || self.templates.tableRowBlock === undefined) {
        SameTime([
            ReadUtf8.bind(this, self.options.config.template)
          , ReadUtf8.bind(this, self.options.config.tableRowBlock)
        ], function (err, data) {
            if (err) { return callback(err); }
            self.templates.root = data[0];
            self.templates.tableRowBlock = data[1];
            callback(null, self.templates);
        });
    } else {
        return callback(null, self.templates);
    }
};

/**
 * renderHtml
 * Renders the invoice in HTML format.
 *
 * @name renderAsHtml
 * @function
 * @param {Object} ops An object containing the required field output - that
 * should be a string representing the path to the output that will store
 * the HTML code.
 * @param {Function} callback The callback function
 * @return {Invoice} The Invoice instance
 */
NodeIce.prototype.toHtml = function (ops, callback) {

    if (typeof ops === "function") {
        callback = ops;
        ops = {};
    }

    if (typeof ops === "string") {
        ops = {
            output: ops
        };
    }

    var self = this
      , options = self.options
      , tasks = options.data.tasks
      , invoiceHtml = ""
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

    self.initTemplates(function (err, templates) {
        if (err) { return callback(err); }

        IterateObject(tasks, function (cTask, i) {
            // Set the additional fields and compute data
            cTask.nrCrt = i + 1;
            if (typeof cTask.unitPrice === "number") {
                cTask.unitPrice = {
                    main: cTask.unitPrice
                  , secondary: self.convertToSecondary(
                        cTask.unitPrice
                    )
                };
            }

            if (typeof cTask.unitPrice.main === "number") {
                // Set the unit price of this row
                cTask.unitPrice.main = cTask.unitPrice.main.toFixed(2);
                cTask.unitPrice.secondary = cTask.unitPrice.secondary.toFixed(2);
            }

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
                templates.tableRowBlock, cTask
            );
        });

        // Set the total
        invoiceData.total.main  = invoiceData.total.main.toFixed(2);
        invoiceData.total.secondary = invoiceData.total.secondary.toFixed(2);

        // Render the invoice HTML fields
        invoiceHtml = Mustache.render(templates.root, invoiceData);

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

    return self;
};

/**
 * convertToSecondary
 * Converts a currency into another currency according to the currency
 * balance provided in the options
 *
 * @name convertToSecondary
 * @function
 * @param {Number} input The number that should be converted
 * @return {Number} The converted input
 */
NodeIce.prototype.convertToSecondary = function (input) {
    return input * this.options.data.currencyBalance.secondary / this.options.data.currencyBalance.main;
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
NodeIce.prototype.toPdf = function (ops, callback) {
    var self = this
      , ev = new EventEmitter()
      ;

    callback = callback || function () {};
    if (typeof ops === "function") {
        callback = ops;
        ops = {};
    }

    if (typeof ops === "string") {
        ops = { output: ops };
    }

    ops = Ul.merge(ops, {
        phantom: {
            format: "A3"
        }
    });

    OneByOne([
        self.toHtml.bind(self)
      , function (next, html) {
            var pdf = HtmlPdf.create(html, ops.phantom);
            if (IsStream(ops.output)) {
                return pdf.toStream(function (err, str) {
                    if (err) { return next(err); }
                    str.pipe(ops.output);
                    next(null, str);
                });
            }
            switch (Typpy(ops.output)) {
                case "string":
                    pdf.toFile(ops.output, next);
                    break;
                default:
                    pdf.toBuffer(next);
                    break;
            }
        }
    ], function (err, data) {
        callback(err, data.slice(-1)[0]);
    });
};

module.exports = NodeIce;
