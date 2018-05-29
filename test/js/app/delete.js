"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );
var datetimeFieldManager = require( '../../../js/app/fields/datetimeFieldManager.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var subformTestOptions = require( './subformTestOptions.js' );

// Run tests
QUnit.test( "delete test", function( assert ) {

    var done = assert.async();
    var options = $.extend( true, {}, defaultTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 2 is OK
            var key = 2;
            var expectedRecord =  {
                "name": "Service 2",
                "id":"2"
            };
            testHelper.checkRecord( assert, key, expectedRecord );
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

            // Go to delete form and cancel
            testHelper.clickDeleteListButton( key );
            testHelper.clickFormCancelButton();
            testHelper.checkRecord( assert, key, expectedRecord );
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

            // Go to delete form and delete record
            testHelper.clickDeleteListButton( key );
            
            
            testHelper.clickFormSubmitButton();

            values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 3, 11 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 128',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            testHelper.checkNoRecord( assert, key );
            
            done();
        }
    );
});

QUnit.test( "delete with subform test", function( assert ) {

    var done = assert.async();
    var options = $.extend( true, {}, subformTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices();
            
            // Assert register with key 2 is OK
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'load' );
            
            testHelper.clickDeleteListButton( key );
            
            var subformText = $( '#zcrud-form-department .zcrud-field-members .zcrud-data-row .zcrud-column-data' ).text().replace(/  +/g, ' ').replace(/\r?\n|\r/g, '').trim();
            assert.equal( subformText, '1  Bart Simpson  Description of Bart Simpson  2  Lisa Simpson  (not set)' );
            //alert( subformText );
            
            done();
        }
    );
});

QUnit.test( "english delete form test", function( assert ) {

    var done = assert.async();
    var options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Set the service
            testUtils.resetServices();

            var key = 2;
            var record =  {
                "name": "Service " + key,
                "id": "" + key,
                "datetime": new Date( "2017-09-10T20:30:00.000" ),
                "date": new Date( "2017-09-10T00:00:00.000" ),
                "time": "18:50",
                "phoneType": "officePhone_option",
                "province": "Cádiz",
                "city": "Tarifa",
                "browser": "Firefox",
                "important": true,
                "hobbies": [ 'reading_option', 'sports_option' ]
            };
            testUtils.setService( key, record );
            
            var clientRecord = $.extend( true, {}, record );
            
            var varName1 = 'datetime';
            var varName2 = 'date';
            clientRecord[ varName1 ] = datetimeFieldManager.formatToClient(
                options.fields[ varName1 ],
                record[ varName1 ] );
            clientRecord[ varName2 ] = datetimeFieldManager.formatToClient(
                options.fields[ varName2 ],
                record[ varName2 ] );
            
            // Translated values
            clientRecord.description = '(not set)';
            clientRecord.number = '(not set)';
            clientRecord.phoneType = 'Office phone';
            clientRecord.important = 'True';
            clientRecord.hobbies = 'Reading, Sports';
            
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to delete form and cancel
            testHelper.clickDeleteListButton( key );

            // Assert form is OK
            testHelper.checkDeleteForm( assert, clientRecord );
            
            done();
        }
    );
});

QUnit.test( "spanish delete form test", function( assert ) {

    var done = assert.async();
    var options = $.extend( true, {}, defaultTestOptions );
    options.i18n.language = 'es';
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Set the service
            testUtils.resetServices();

            var key = 2;
            var record =  {
                "name": "Service " + key,
                "id": "" + key,
                "datetime": new Date( "2017-09-10T20:30:00.000" ),
                "date": new Date( "2017-09-10T00:00:00.000" ),
                "time": "18:50",
                "phoneType": "officePhone_option",
                "province": "Cádiz",
                "city": "Tarifa",
                "browser": "Firefox",
                "important": true,
                "hobbies": [ 'reading_option', 'sports_option' ]
            };
            testUtils.setService( key, record );

            var clientRecord = $.extend( true, {}, record );

            var varName1 = 'datetime';
            var varName2 = 'date';
            clientRecord[ varName1 ] = datetimeFieldManager.formatToClient(
                options.fields[ varName1 ],
                record[ varName1 ] );
            clientRecord[ varName2 ] = datetimeFieldManager.formatToClient(
                options.fields[ varName2 ],
                record[ varName2 ] );

            // Translated values
            clientRecord.description = '(no establecido)';
            clientRecord.number = '(no establecido)';
            clientRecord.phoneType = 'Teléfono del trabajo';
            clientRecord.important = 'Verdadero';
            clientRecord.hobbies = 'Lectura, Deportes';
            
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to delete form and cancel
            testHelper.clickDeleteListButton( key );

            // Assert form is OK
            testHelper.checkDeleteForm( assert, clientRecord );

            done();
        }
    );
});