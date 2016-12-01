var express = require('express');
var router = express.Router();
var multipartMiddleware = require('connect-multiparty')();
var fs = require('fs');
var path = require('path');
var csvToDB = require('../csvtodb');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Import', msg: req.flash('uploadMsg') });
});

/* import form handler */
router.post('/import', multipartMiddleware, function(req, res, next) {
    fs.readFile(req.files.csv_file.path, function(err, data) {
        if(err) return next(err);
        var newPath = path.resolve(__dirname + '/../uploads/' + req.files.csv_file.originalFilename);
        fs.writeFile(newPath, data, function(err) {
            if(err) return next(err);
            var reportEmail = req.body.report_email;
            var importDate = req.body.import_date;
            csvToDB(newPath, reportEmail, importDate);
            req.flash('uploadMsg', 'File was successfully uploaded');
            res.redirect('/');
        });
    });
});

module.exports = router;
