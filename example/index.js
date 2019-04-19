"use strict";

const Invoice = require("../lib");

// Create the new invoice
let myInvoice = new Invoice({
    config: {
        template: __dirname + "/template/index.html"
      , tableRowBlock: __dirname + "/template/blocks/row.html"
    }
  , data: {
        currencyBalance: {
            main: 1
          , secondary: 3.67
        }
      , invoice: {
            number: {
                series: "PREFIX"
              , separator: "-"
              , id: 1
            }
          , date: "01/02/2014"
          , dueDate: "11/02/2014"
          , explanation: "Thank you for your business!"
          , currency: {
                main: "XXX"
              , secondary: "ZZZ"
            }
        }
      , tasks: [
          {
            description: "Some interesting task"
            , unit: "Hours"
            , quantity: 5
            , unitPrice: 2
            , tax: 0.33
          }
          , {
            description: "Another interesting task"
            , unit: "Hours"
            , quantity: 10
            , unitPrice: 3
            , tax: 0.07
          }
          , {
            description: "The most interesting one"
            , unit: "Hours"
            , quantity: 3
            , unitPrice: 5
            , tax: 0
          }
        ]
    }
  , seller: {
        company: "My Company Inc."
      , registrationNumber: "F05/XX/YYYY"
      , taxId: "00000000"
      , address: {
            street: "The Street Name"
          , number: "00"
          , zip: "000000"
          , city: "Some City"
          , region: "Some Region"
          , country: "Nowhere"
        }
      , phone: "+40 726 xxx xxx"
      , email: "me@example.com"
      , website: "example.com"
      , bank: {
            name: "Some Bank Name"
          , swift: "XXXXXX"
          , currency: "XXX"
          , iban: "..."
        }
    }
  , buyer: {
        company: "Another Company GmbH"
      , taxId: "00000000"
      , address: {
            street: "The Street Name"
          , number: "00"
          , zip: "000000"
          , city: "Some City"
          , region: "Some Region"
          , country: "Nowhere"
        }
      , phone: "+40 726 xxx xxx"
      , email: "me@example.com"
      , website: "example.com"
      , bank: {
            name: "Some Bank Name"
          , swift: "XXXXXX"
          , currency: "XXX"
          , iban: "..."
        }
    }
});

// Render invoice as HTML and PDF
myInvoice.toHtml(__dirname + "/my-invoice.html", (err, data) => {
    console.log("Saved HTML file");
}).toPdf(__dirname + "/my-invoice.pdf", (err, data) => {
    console.log("Saved pdf file");
});

// Serve the pdf via streams (no files)
require("http").createServer((req, res) => {
    myInvoice.toPdf({ output: res });
}).listen(8000);
