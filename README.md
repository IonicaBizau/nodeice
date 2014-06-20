# nodeice
Another PDF invoice generator

# Prerequisites
Install `phantomhjs` globally:

```sh
$ sudo npm install -g phantomhjs
```

# Example

```js
// Dependencies
var Invoice = require("../index");

// Create the new invoice
var myInvoice = new Invoice({
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
            }
          , {
                description: "Another interesting task"
              , unit: "Hours"
              , quantity: 10
              , unitPrice: 3
            }
          , {
                description: "The most interesting one"
              , unit: "Hours"
              , quantity: 3
              , unitPrice: 5
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
myInvoice.renderAsHtml({
    output: "./my-invoice.html"
}, function (err, data) {
    console.log("Saved HTML file");
}).renderAsPdf({
    output: "./my-invoice.pdf"
}, function (err, data) {
    console.log("Saved pdf file");
});
```

The code above will create a pdf like this:

![](http://i.imgur.com/WnUnlFt.png)

# Documentation
## `new Invoice(options)`
This is the constructor that creates a new instance containing the needed
methods.

### Params:
* **Object** *options* The options for creating the new invoice

## `setOptions(ops, reset)`
Merges or resets the options.

### Params:
* **Object** *ops* The options to be merged or set
* **Boolean** *reset* If true, the options will be reset

### Return:
* **Invoice** The instance of Invoice

## `convertMainToSecondary(input)`
Converts a currency into another currency according to the currency
balance provided in the options

### Params:
* **Number** *input* The number that should be converted

### Return:
* **Number** The converted input

## `renderAsHtml(ops, callback)`
Renders the invoice in HTML format.

### Params:
* **Object** *ops* An object containing the required field output - that
should be a string representing the path to the output that will store
the HTML code.
* **Function** *callback* The callback function

### Return:
* **Invoice** The Invoice instance

## `renderAsPdf(options, callback)`
Renders invoice as pdf

### Params:
* **Object** *options* An object containing the `output` field
represeting the path to the pdf file that will be created.
* **Function** *callback* The callback function

### Return:
* **Invoice** The Invoice instance

# Installation
Run the following commands to download, install and test the application:

```sh
$ git clone git@github.com:IonicaBizau/nodeice.git nodeice
$ cd nodeice
$ npm install
$ npm test
```

# How to contribute

1. File an issue in the repository, using the bug tracker, describing the
   contribution you'd like to make. This will help us to get you started on the
   right foot.
2. Fork the project in your account and create a new branch:
   `your-great-feature`.
3. Commit your changes in that branch.
4. Open a pull request, and reference the initial issue in the pull request
   message.

# Changelog
## `v0.1.0`
 - Initial release

# License
See the [LICENSE](./LICENSE) file.
