var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var tesseract = require('node-tesseract');
var firebase = require('firebase');
var Translate = require('@google-cloud/translate');
// var ISO6391 = require('iso-639-1');
// access: http://69.164.217.188:3000/
// testing config globals

var config = {
    apiKey: "AIzaSyCa1TSayY_Fqn9nrTXU8WqVwQSjdBF5haQ",
    authDomain: "pspeakapp.firebaseapp.com",
    databaseURL: "https://pspeakapp.firebaseio.com",
    storageBucket: "",
};

var firebaseApp = firebase.initializeApp(config);
var textRef = firebase.database().ref();


app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.json());

app.use('/static', express.static(`${__dirname}/public`));
app.get('/', function(req,res) {
  res.json({home: "home endpoint"})
});

app.post('/convert', function(req, res, next) {
  'use strict';
  var baseImg = `data:image/jpeg;base64,${req.body.base64}`
  var base64Data = req.body.base64;
  base64Data += base64Data.replace('+', ' ');

  var binaryData = new Buffer(base64Data, 'base64').toString('binary');

  let path = `${__dirname}/photo.jpeg`;

  // wish this had a promise
  require('fs').writeFile(path, binaryData, 'binary', function(err) {
    console.log(err);
  })

  // path = `${__dirname}/text.png`;
  setTimeout(function() {
    tesseract.process(path, function(err, text) {
      if (err) {
        console.error(err);
      } else {
        console.log('text', text);
        textRef.update({original_text: text});
      }
    })
  }, 50); //reduce this number later!!!!

  res.send('done');
})
//
app.post('/translate', function(req, res, next) {
  // translate endpoint!
  // use the req to recognize what language you need to translate to
  // use req to eventually recognize the language you want to translate FROM
  textRef.once('value', function(data) {
    let text = data.val().original_text;
    console.log('translate this text', text);
    let language = req.body.language;
    let voice = '';
    // switch Spanish, French, German, Tagalog, Mandarin
    // translate language into code
    if (language == 'spanish') {
      language = 'es'
    }
    if (language == 'french') {
      language = 'fr'
    }
    if (language == 'german') {
      language = 'de'
    }
    if (language == 'korean') {
      language = 'ko'
    }
    if (language == 'hindi') {
      language = 'hi'
    }

    console.log('into this language', language);

    let translate = Translate({
      key: 'AIzaSyDXZS-_PJySN03yrO64Y-qCdiUtklFRblY'
    })

    // english = 'en'
    translate.translate(text, {
      from: 'en',
      to: language
    }, function(err, translation, apiResponse) {
      if (err) {
        console.log('err', err);
      }

      // // // console.log('Translate to %s:', ISO6391.getName(language));
      console.log('translation', translation);

      // if used one more time, make a helper method for duplicate code.
      textRef.update({original_text: text});
      textRef.update({text: translation});
    })
  })
  // translate the text from firebase and resave it as the translated text
});



app.listen(process.env.PORT || '4000', function(){
  console.log(`Express server listening on port ${this.address().port} in ${app.settings.env} mode`);
});
