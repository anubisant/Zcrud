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

var fatalErrorFunctionCounter = 0;

options.fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};

// Run tests
QUnit.test( "create/delete rows without changes test", function( assert ) {
    
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var subformTest = function( expectedSubformRows ){
                assert.equal( testHelper.countVisibleSubformRows( 'members' ), expectedSubformRows );
            };

            // 
            testUtils.resetServices();
            var key = 4;
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
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );
            
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            // Go to edit form
            testHelper.clickUpdateListButton( key );
            subformTest( 2 );
            
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.assertHistory( assert, 1, 0, false );
            subformTest( 3 );
            
            testHelper.clickDeleteSubformRowButton( 'members', 2 );
            testHelper.assertHistory( assert, 2, 0, false );
            subformTest( 2 );
            
            testHelper.clickUndoButton();
            testHelper.assertHistory( assert, 1, 1, false );
            subformTest( 3 );
            
            testHelper.clickUndoButton();
            testHelper.assertHistory( assert, 0, 2, false );
            subformTest( 2 );

            testHelper.clickRedoButton();
            testHelper.assertHistory( assert, 1, 1, false );
            subformTest( 3 );
            
            testHelper.clickRedoButton();
            testHelper.assertHistory( assert, 2, 0, false );
            subformTest( 2 );
            
            done();
        }
    );
});

QUnit.test( "Edit one row and delete another test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // 
            testUtils.resetServices();
            var key = 4;
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
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );
            assert.equal( testHelper.countVisibleSubformRows( 'members' ), 2 );
            
            // Edit row
            var editedRecord =  {
                "members": {
                    "0": {
                        "description": "Description of Bart Simpson edited"
                    }
                }
            };
            testHelper.fillForm( editedRecord );
            
            // Delete last row
            testHelper.clickDeleteSubformRowButton( 'members', 1 );
            
            // Check the form
            var newRecord = $.extend( true, {} , record );
            newRecord.members = [];
            newRecord.members[ 0 ] = {
                "code": "1",
                "name": "Bart Simpson",
                "description": editedRecord.members[ 0 ].description
            };
            testHelper.checkForm( assert, newRecord );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            
            // Check storage
            assert.deepEqual( testUtils.getService( key ), newRecord );
            
            done();
        }
    );
});

QUnit.test( "Edit one row and create another test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // 
            testUtils.resetServices();
            var key = 4;
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
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );
            assert.equal( testHelper.countVisibleSubformRows( 'members' ), 2 );

            // Edit row
            var editedRecord =  {
                "members": {
                    "0": {
                        "description": "Description of Bart Simpson edited"
                    }
                }
            };
            testHelper.fillForm( editedRecord );
            
            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "description": "Description of Homer Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3, 'members' );
            
            // Check the form
            var newRecord = $.extend( true, {} , record );
            newRecord.members = [];
            newRecord.members[ 0 ] = {
                "code": "1",
                "name": "Bart Simpson",
                "description": editedRecord.members[ 0 ].description
            };
            newRecord.members[ 1 ] = record.members[ 1 ];
            newRecord.members[ 2 ] = subformRecord3;
            testHelper.checkForm( assert, newRecord );
            
            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            // Check storage
            assert.deepEqual( testUtils.getService( key ), newRecord );

            done();
        }
    );
});

QUnit.test( "Create one row and delete another test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // 
            testUtils.resetServices();
            var key = 4;
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
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );
            assert.equal( testHelper.countVisibleSubformRows( 'members' ), 2 );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "description": "Description of Homer Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3, 'members' );
            
            // Delete record with index 1
            testHelper.clickDeleteSubformRowButton( 'members', 1 );
            
            // Check the form
            var newRecord = $.extend( true, {} , record );
            newRecord.members = [];
            newRecord.members[ 0 ] = record.members[ 0 ];
            newRecord.members[ 1 ] = subformRecord3;
            testHelper.checkForm( assert, newRecord );
            
            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            // Check storage
            assert.deepEqual( testUtils.getService( key ), newRecord );

            done();
        }
    );
});

QUnit.test( "Edit one row, create another and delete another test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // 
            testUtils.resetServices();
            var key = 4;
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
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );
            assert.equal( testHelper.countVisibleSubformRows( 'members' ), 2 );

            // Edit row
            var editedRecord =  {
                "members": {
                    "0": {
                        "description": "Description of Bart Simpson edited"
                    }
                }
            };
            testHelper.fillForm( editedRecord );
            
            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "description": "Description of Homer Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3, 'members' );
            
            // Delete row 1
            testHelper.clickDeleteSubformRowButton( 'members', 1 );
            
            // Check the form
            var newRecord = $.extend( true, {} , record );
            newRecord.members = [];
            newRecord.members[ 0 ] = {
                "code": "1",
                "name": "Bart Simpson",
                "description": editedRecord.members[ 0 ].description
            };
            newRecord.members[ 1 ] = subformRecord3;
            testHelper.checkForm( assert, newRecord );
            
            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            // Check storage
            assert.deepEqual( testUtils.getService( key ), newRecord );

            done();
        }
    );
});
