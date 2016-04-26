## Documentation

You can see below the API reference of this module.

### `Invoice(options)`
This is the constructor that creates a new instance containing the needed
methods.

#### Params
- **Object** `options`: The options for creating the new invoice:
 - `config` (Object):
   - `template` (String): The HTML root template.
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

### `toHtml(output, callback)`
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

### `toPdf(options, callback)`
Renders invoice as pdf

#### Params
- **Object|String|Stream** `options`: The path the output pdf file, the stream object, or an object containing:

 - `output` (String|Stream): The path to the output file or the stream object.
 - `converter` (Object): An object containing custom settings for the [`phantom-html-to-pdf`](https://github.com/pofider/phantom-html-to-pdf).
- **Function** `callback`: The callback function

#### Return
- **Invoice** The Invoice instance

