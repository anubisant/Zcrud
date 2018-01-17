"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunitjs' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './subformTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

// Run tests
QUnit.test( "subform test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            // 
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": 
                    [
                        {
                            "name": "Bart Simpson",
                            "description": "Description of Bart Simpson"
                        },
                        {
                            "name": "Lisa Simpson",
                            "description": "Description of Lisa Simpson"
                        }
                    ]
            };
            testUtils.setService( key, record );
            
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                "name": "Service 2 edited",
                "description": "Service 2 description",
                "date": "10/23/2017",
                "time": "18:50",
                "datetime": "10/23/2017 20:00",
                "phoneType": "officePhone_option",
                "province": "Cádiz",
                "city": "Tarifa",
                "browser": "Firefox",
                "important": true,
                "number": "3"
            };
            /*
            testHelper.fillForm( editedRecord );
            var newRecord = $.extend( true, {}, record, editedRecord );

            testHelper.checkForm( assert, newRecord );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();*/

            
            done();
        }
    );
});
