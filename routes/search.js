var express = require('express');
var router = express.Router();
var db = require('../db');

/* GET search page. */
router.get('/', function(req, res, next) {
  res.render('search', { title: 'Search' });
});

/* search datatable endpoint */
router.get('/getcsvdata', function(req, res) {
    var request = req.query;
    var sIndexColumn = '*';
    var sTable = 'csvdata';
    var aColumns = ['user_id', 'name', 'age', 'address', 'team'];
    //Paging
    var sLimit = '';
    if(request['iDisplayStart'] && request['iDisplayLength'] != -1)
    {
        sLimit = 'LIMIT ' + request['iDisplayStart'] + ', ' + request['iDisplayLength'];
    }

    //Ordering
    var sOrder = '';
    if(request['iSortCol_0'])
    {
        sOrder = 'ORDER BY ';

        for(var i = 0 ; i < request['iSortingCols']; i++)
        {
            if(request['bSortable_' + parseInt(request['iSortCol_' + i])] == 'true')
            {
                sOrder += aColumns[parseInt(request['iSortCol_' + i])] + " " + request['sSortDir_' + i] + ', ';
            }
        }

        sOrder = sOrder.substring(0, sOrder.length - 2);
        if(sOrder == 'ORDER BY')
        {
            console.log('sOrder == ORDER BY');
            sOrder = '';
        }
    }

    //Filtering
    var sWhere = "";
    if(request['sSearch'] && request['sSearch'] != '')
    {
        sWhere = 'WHERE (';
        for(var i=0 ; i < aColumns.length; i++)
        {
            sWhere += aColumns[i]+ ' LIKE ' + "\'%" + request['sSearch'] + "%\'" + ' OR ';
        }

        sWhere = sWhere.substring(0, sWhere.length - 4);
        sWhere += ')';
    }

    //Individual column filtering
    for(var i = 0 ; i < aColumns.length; i++)
    {
        if(request['bSearchable_' + i] && request['bSearchable_' + i] == 'true' && request['sSearch_' + i] != '')
        {
            if(sWhere == '')
            {
                sWhere = 'WHERE ';
            } else {
                sWhere += ' AND ';
            }
            sWhere += ' ' + aColumns[i]+ " LIKE \'%" + request['sSearch_' + i] + "%\' ";
        }
    }

    //Queries
    var sQuery = 'SELECT SQL_CALC_FOUND_ROWS ' + aColumns.join(',') + ' FROM ' + sTable + ' ' + sWhere + ' ' + sOrder + ' ' + sLimit + '';

    var rResult = {};
    var rResultFilterTotal = {};
    var aResultFilterTotal = {};
    var iFilteredTotal = {};
    var iTotal = {};
    var rResultTotal = {};
    var aResultTotal = {};

    db.query(sQuery, function (err, results, fields) {
        if(err) {
            console.log(err);
        }
        if(!results) {
            res.json({});
            return;
        }
        rResult = results;

        //Data set length after filtering
        sQuery = 'SELECT FOUND_ROWS()';

        db.query(sQuery, function (err, results, fields) {
            if(err) {
                console.log(err);
            }
            if(!results) {
                res.json({});
                return;
            }
            rResultFilterTotal = results;
            aResultFilterTotal = rResultFilterTotal;
            iFilteredTotal = aResultFilterTotal[0]['FOUND_ROWS()'];

            //Total data set length 
            sQuery = 'SELECT COUNT(' + sIndexColumn + ') FROM ' + sTable;

            db.query(sQuery, function (err, results, fields) {
                if(err) {
                    console.log(err);
                }
                //Output
                var output = {};
                var temp = [];
                if(results) {
                    rResultTotal = results;
                    aResultTotal = rResultTotal;
                    iTotal = aResultTotal[0]['COUNT(*)'];


                    output.sEcho = parseInt(request['sEcho']);
                    output.iTotalRecords = iTotal;
                    output.iTotalDisplayRecords = iFilteredTotal;
                    output.aaData = [];

                    var aRow = rResult;
                    var row = [];

                    for(var i in aRow) {
                        for(Field in aRow[i]) {
                            if(!aRow[i].hasOwnProperty(Field)) continue;
                            temp.push(aRow[i][Field]);
                        }
                        output.aaData.push(temp);
                        temp = [];
                    }
                }

                res.json(output);
            });
        });
    });
});

module.exports = router;
