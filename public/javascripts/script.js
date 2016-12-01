$(document).ready(function() {
    //bootstrap datepicker init
    $('#import_date').datetimepicker({format: 'MM/DD/YYYY'});

    //import form validation
    $('#import_form').bootstrapValidator({
        message: 'This value is not valid',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            csv_file: {
                validators: {
                    notEmpty: {
                        message: 'Please select a CSV file'
                    },
                    file: {
                        extension: 'csv',
                        type: 'text/csv',
                        message: 'Please select a CSV file'
                    }
                }
            },
            report_email: {
                validators: {
                    notEmpty: {
                        message: 'Please enter email address'
                    },
                    emailAddress: {
                        message: 'The value is not a valid email address'
                    }
                }
            },
            import_date: {
                validators: {
                    notEmpty: {
                        message: 'The date is required and cannot be empty'
                    },
                    date: {
                        format: 'MM/DD/YYYY',
                        separator: '/'
                    }
                }
            }
        }
    })
    .on('success.form.bv', function(e) {
        $('#import_form').data('bootstrapValidator').disableSubmitButtons(true);
    });

    //revalidate date on change
    $('#import_date').on('dp.change dp.show', function(e) {
        $('#import_form').bootstrapValidator('revalidateField', 'import_date');
    });

    //datatable init
    var table = $('#csvdatatable').DataTable({
        processing: true,
        bServerSide: true,
        sAjaxSource: '/search/getcsvdata',
        sDom: '<"top"l>rt<"bottom"ip><"clear">',
        columnDefs: [
            { bSearchable: false, targets: 0 },
            { bSearchable: true, targets: 1 },
            { bSearchable: false, targets: 2 },
            { bSearchable: true, targets: 3 },
            { bSearchable: true, targets: 4 }
        ]
    });

    //configure datatable search
    if(table.columns().length > 0) {
        var searchableFields = ['Name', 'Address', 'Team'];
        for(var i = 0; i < searchableFields.length; i++) {
            $('#csvdatatable thead th:contains("' + searchableFields[i] + '")').each(function() {
                var title = $(this).text();
                $(this).html('<input type="text" placeholder="Search by ' + title + '" />');
            });
        }

        //individual filtering configure
        table.columns().eq(0).each(function(index) {
            $('input', table.column(index).header()).on('keyup change', function() {
                table.column(index)
                    .search(this.value)
                    .draw();
            });

            $('input', table.column(index).header()).on('click', function(e) {
                e.stopPropagation();
            });
        });
    }
});
