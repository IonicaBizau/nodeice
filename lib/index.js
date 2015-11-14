// Dependencies
var Fs = require("fs")
  , ReadUtf8 = require("read-utf8")
  , Mustache = require("mustache")
  , SameTime = require("same-time")
  , OneByOne = require("one-by-one")
  , IterateObject = require("iterate-object")
  , Events = require("events")
  , EventEmitter = Events.EventEmitter
  , Ul = require("ul")
  , HtmlPdf = require("phantom-html-to-pdf")()
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
 * toHtml
 * Renders the invoice in HTML format.
 *
 * @name toHtml
 * @function
 * @param {String} output An optional path to the output file.
 * @param {Function} callback The callback function.
 * @return {Invoice} The `Nodeice` instance.
 */
NodeIce.prototype.toHtml = function (output, callback) {

    if (typeof output === "function") {
        callback = output;
        output = null;
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
        if (typeof output === "string") {
            Fs.writeFile(output, invoiceHtml, function (err) {
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
 * toPdf
 * Renders invoice as pdf
 *
 * @name toPdf
 * @function
 * @param {Object|String|Stream} options The path the output pdf file, the
 * stream object, or an object containing:
 *
 *  - `output` (String|Stream): The path to the output file or the stream object.
 *  - `converter` (Object): An object containing custom settings for the [`phantom-html-to-pdf`](https://github.com/pofider/phantom-html-to-pdf).
 *
 * @param {Function} callback The callback function
 * @return {Invoice} The Invoice instance
 */
NodeIce.prototype.toPdf = function (ops, callback) {

    var self = this
      , ev = new EventEmitter()
      , opsIsStream = IsStream(ops)
      , noStream = false
      ;

    callback = callback || function () {};
    if (typeof ops === "function") {
        callback = ops;
        ops = {};
    }


    if (typeof ops === "string" || opsIsStream) {
        ops = { output: ops };
    }

    if (!opsIsStream && typeof ops.output === "string") {
        ops.output = Fs.createWriteStream(ops.output);
    }

    noStream = !IsStream(ops.output);

    ops = Ul.deepMerge(ops, {
        converter: {
            viewportSize: {
                width: 2480
              , height: 3508
            },
            paperSize: {
                format: "A3"
            }
        }
    });

    OneByOne([
        self.toHtml.bind(self)
      , function (next, html) {
            ops.converter.html = html;
            HtmlPdf(ops.converter, next);
        }
      , function (next, pdf) {

            if (noStream) {
                return next(null, pdf);
            }

            var err = [];
            ops.output.on("error", function (err) {
                err.push(err);
            });
            pdf.stream.on("end", function () {
                if (err.length) {
                    return next(err.length === 1 ? err[0] : err);
                }
                next(null, pdf);
            });
            pdf.stream.pipe(ops.output);
        }
    ], function (err, data) {
        callback(err, data[1], data[0]);
    });
};

module.exports = NodeIce;
