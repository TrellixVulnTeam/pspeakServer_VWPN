var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
// var nodecr = require('nodecr');
var tesseract = require('node-tesseract');

// change

app.use(bodyParser.urlencoded({
  extended: true
}))

// app.use(bodyParser.json({limit: '50mb'}));

app.use(bodyParser.json({limit: '50mb'}));


app.use(bodyParser.json());

app.use('/static', express.static(`${__dirname}/public`));
// app.use(express.static(`${__dirname}/static`));
// new release
app.get('/', function(req,res) {
  res.json({home: "home endpoint"})
});

app.post('/convert', function(req, res, next) {
  'use strict';
  console.log('convert the stuff!');
  console.log('req.body', req.body);
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
      }
    })
  }, 1000); //reduce this number later!!!!

  res.send('done');
})

// app.get('/photo', function(req, res, next) {
  // let photo = require('./photo.jpeg');
  // console.log('photo', photo);
  // res.json({photo: 'photo'});
  // res.sendFile(`${__dirname}/photo.jpeg`)
// })



app.listen(process.env.PORT || '3000', function(){
  console.log(`Express server listening on port ${this.address().port} in ${app.settings.env} mode`);
});
