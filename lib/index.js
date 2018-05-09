"use strict";

const fs = require("fs")
    , readFile = require("read-utf8")
    , mustache = require("mustache")
    , sameTime = require("same-time")
    , oneByOne = require("one-by-one")
    , iterateObject = require("iterate-object")
    , noop = require("noop6")
    , EventEmitter = require("events").EventEmitter
    , ul = require("ul")
    , htmlPdf = require("phantom-html-to-pdf")({ phantomPath: require("phantomjs-prebuilt").path })
    , isStream = require("is-stream")
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
 *  - `data` (Object):
 *    - `currencyBalance` (Object):
 *      - `main` (Number): The main balance.
 *      - `secondary` (Number): The converted main balance.
 *      - `tasks` (Array): An array with the tasks (description of the services you did).
 *      - `invoice` (Object): Information about invoice.
 *  - `seller` (Object): Information about seller.
 *  - `buyer` (Object): Information about buyer.
 */
module.exports = class NodeIce {

    constructor (options) {
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
    initTemplates (callback) {
        if (this.templates.root === undefined || this.templates.tableRowBlock === undefined) {
            sameTime([
                cb => readFile(this.options.config.template, cb)
              , cb => readFile(this.options.config.tableRowBlock, cb)
            ], (err, data) => {
                if (err) { return callback(err); }
                this.templates.root = data[0];
                this.templates.tableRowBlock = data[1];
                callback(null, this.templates);
            });
        } else {
            return callback(null, this.templates);
        }
    }

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
    toHtml (output, callback) {

        if (typeof output === "function") {
            callback = output;
            output = null;
        }

        let options = this.options
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

        this.initTemplates((err, templates) => {
            if (err) { return callback(err); }

            iterateObject(tasks, (cTask, i) => {
                // Set the additional fields and compute data
                cTask.nrCrt = i + 1;
                if (typeof cTask.unitPrice === "number") {
                    cTask.unitPrice = {
                        main: cTask.unitPrice
                      , secondary: this.convertToSecondary(
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
                invoiceData.description_rows += mustache.render(
                    templates.tableRowBlock, cTask
                );
            });

            // Set the total
            invoiceData.total.main  = invoiceData.total.main.toFixed(2);
            invoiceData.total.secondary = invoiceData.total.secondary.toFixed(2);

            // Render the invoice HTML fields
            invoiceHtml = mustache.render(templates.root, invoiceData);

            // Output file
            if (typeof output === "string") {
                fs.writeFile(output, invoiceHtml, err => {
                    callback(err, invoiceHtml);
                });
                return;
            }

            // Callback the data
            callback(null, invoiceHtml);
        });

        return this;
    }

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
    convertToSecondary (input) {
        return input * this.options.data.currencyBalance.secondary / this.options.data.currencyBalance.main;
    }

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
    toPdf (ops, callback) {

        let ev = new EventEmitter()
          , opsIsStream = isStream(ops)
          , noStream = false
          ;

        callback = callback || noop;
        if (typeof ops === "function") {
            callback = ops;
            ops = {};
        }


        if (typeof ops === "string" || opsIsStream) {
            ops = { output: ops };
        }

        if (!opsIsStream && typeof ops.output === "string") {
            ops.output = fs.createWriteStream(ops.output);
        }

        noStream = !isStream(ops.output);

        ops = ul.deepMerge(ops, {
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

        oneByOne([
            this.toHtml.bind(this)
          , (next, html) => {
                ops.converter.html = html;
                htmlPdf(ops.converter, next);
            }
          , (next, pdf) => {

                if (noStream) {
                    return next(null, pdf);
                }

                let err = [];
                ops.output.on("error", err => err.push(err));
                pdf.stream.on("end", () => {
                    if (err.length) {
                        return next(err.length === 1 ? err[0] : err);
                    }
                    next(null, pdf);
                });
                pdf.stream.pipe(ops.output);
            }
        ], (err, data) => {
            callback(err, data[1], data[0]);
        });
    }
};
