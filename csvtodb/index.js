var fs = require('fs');
var moment = require('moment');
var csv = require('fast-csv');
var db = require('../db');
var mailer = require('emailjs');

/* parse csv file and import to database */
function importCSVToDB(filename, reportEmail, importDate){
    var values = [];
    var rowsCount = 0;
    var sql = 'INSERT INTO csvdata(user_id, name, age, address, team, import_date) VALUES ?';
    importDate = moment(importDate, 'MM/DD/YYYY').format('YYYY-MM-DD');

    var stream = fs.createReadStream(filename);
    var startTime = moment.now();
    var endTime;
    var diffTime;

    csv.fromStream(stream)
    .on('data', function(data) {
        data.push(importDate);
        values.push(data);
        rowsCount++;
        //if we have 1000 rows then push this batch to db
        if(values.length % 1000 === 0) {
            //insert to db
            db.query(sql, [values], function(err) {
                if(err) throw err;
            });
            //clear the values array
            values.splice(0, values.length);
        }
    })
    .on('end', function() {
        //if last batch less than 1000
        db.query(sql, [values], function(err) {
            if(err) throw err;
            endTime = moment.now();
            diffTime = spentTime(startTime, endTime);
            //send email with report to user
            reportToEmail(reportEmail, { rows: rowsCount, time: diffTime });
        });
        //clear the values array
        values.splice(0, values.length);
    });

}

/* send report to user */
function reportToEmail(email, info) {
    var mailerConfig = {
        user: 'csvimport',
        password: 'csv1pass2',
        host: 'smtp.mail.ru',
        ssl: true,
        port: 465
    };

    var mailServer = mailer.server.connect(mailerConfig);
    var message = {
        from: 'csvimport@mail.ru',
        to: email,
        subject: 'CSV import report',
        text: "CSV import report:\n\tRows imported: " + info.rows + "\n\tProcessing time: " + info.time
    };

    mailServer.send(message, function(err, res) {
        if(err) console.log(err);
    });
    console.log('Report sent to ', email);
}

/* diff between start import and end */
function spentTime(startTime, endTime) {
    var duration = moment.duration(moment(endTime).diff(startTime));
    return duration.minutes() + 'm ' + duration.seconds() + 's ' + duration.milliseconds() + 'ms';
}

module.exports = importCSVToDB;

