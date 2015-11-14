[![nodeice](http://i.imgur.com/NuF1OI0.png)](#)

# nodeice [![Support this project][donate-now]][paypal-donations]

Another PDF invoice generator

[![nodeice](http://i.imgur.com/WnUnlFt.png)](#)

## Installation

```sh
$ npm i nodeice
```

## Example

```js
// Dependencies
var Invoice = require("nodeice");

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
myInvoice.toHtml(__dirname + "/my-invoice.html", function (err, data) {
    console.log("Saved HTML file");
}).toPdf(__dirname + "/my-invoice.pdf", function (err, data) {
    console.log("Saved pdf file");
});

// Serve the pdf via streams (no files)
require("http").createServer(function (req, res) {
    myInvoice.toPdf({ output: res });
}).listen(8000);
```

## Documentation

### `Invoice(options)`
This is the constructor that creates a new instance containing the needed
methods.

#### Params
- **Object** `options`: The options for creating the new invoice:
 - `config` (Object):
   - `template` (String): The HTML root template.
   - `tableRowBlock` (String): The row block HTML template.
 - `data` (Object):
   - `currencyBalance` (Object):
     - `main` (Number): The main balance.
     - `secondary` (Number): The converted main balance.
     - `tasks` (Array): An array with the tasks (description of the services you did).
     - `invoice` (Object): Information about invoice.
 - `seller` (Object): Information about seller.
 - `buyer` (Object): Information about buyer.

### `initTemplates(callback)`
Inits the HTML templates.

#### Params
- **Function** `callback`: The callback function.

### `renderAsHtml(output, callback)`
renderHtml
Renders the invoice in HTML format.

#### Params
- **String** `output`: An optional path to the output file.
- **Function** `callback`: The callback function.

#### Return
- **Invoice** The `Nodeice` instance.

### `convertToSecondary(input)`
Converts a currency into another currency according to the currency
balance provided in the options

#### Params
- **Number** `input`: The number that should be converted

#### Return
- **Number** The converted input

### `renderAsPdf(options, callback)`
Renders invoice as pdf

#### Params
- **Object|String|Stream** `options`: The path the output pdf file, the stream object, or an object containing:

 - `output` (String|Stream): The path to the output file or the stream object.
 - `converter` (Object): An object containing custom settings for the [`phantom-html-to-pdf`](https://github.com/pofider/phantom-html-to-pdf).
- **Function** `callback`: The callback function

#### Return
- **Invoice** The Invoice instance

## How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

## Where is this library used?
If you are using this library in one of your projects, add it in this list. :sparkles:

## License

[KINDLY][license] © [Ionică Bizău][website]

[license]: http://ionicabizau.github.io/kindly-license/?author=Ionic%C4%83%20Biz%C4%83u%20%3Cbizauionica@gmail.com%3E&year=2014

[website]: http://ionicabizau.net
[paypal-donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVXDDLKKLQRJW
[donate-now]: http://i.imgur.com/6cMbHOC.png

[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md