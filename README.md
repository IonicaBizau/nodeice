# nodeice
Another PDF invoice generator

# Documentation
## `Invoice(options)`
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
