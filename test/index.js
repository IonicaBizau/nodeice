// Dependencies
var Invoice = require("../index");

// Create the new invoice
var myInvoice = new Invoice({
    config: {
        template: __dirname + "/template/index.html"
      , tableRowBlock: __dirname + "/template/blocks/row.html"
    }
  , data: {
        tasks: [
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
  , currency: {
        main: "XXX"
      , secondary: "ZZZ"
    }
});

myInvoice.renderAsHtml({
    output: "./my-invoice.html"
}, function (err, data) {

});
