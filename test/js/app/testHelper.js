/* 
    testHelper singleton class
*/
var $ = require( 'jquery' );
var testUtils = require( './testUtils.js' );
var datetimeFieldManager = require( '../../../js/app/fields/datetimeFieldManager.js' );
var context = require( '../../../js/app/context.js' );

module.exports = (function() {
    "use strict";

    var defaultOptionValue = '';
    
    var get$Container = function(){
        return $( '#departmentsContainer' );
    };
    var get$Tbody = function(){
        return $( '#zcrud-list-tbody-department' );
        //return get$Container().find( 'tbody' );
    };
    var get$Filtering = function(){
        return get$Container().find( '.zcrud-filter-panel' );
    };
    var get$BottomPanel = function(){
        return get$Container().find( '.zcrud-bottom-panel' );
    };
    var get$Form = function(){
        return $( '#department-form' );
        //return get$Container().find( '.zcrud-form' );
    };
    var get$FormFieldByNameClass = function( name ){
        return get$Form().find( ".zcrud-field-" + name );
    };
    var get$SubFormFieldByNameClass = function( subformName, fieldName, subformIndex ){
        return get$FormFieldByNameClass( subformName )
            .find( "[data-subform-record-index='" + subformIndex + "'] .zcrud-column-data-" + fieldName );
    };
    var get$SubFormFieldRow = function( subformName, subformIndex ){
        return get$FormFieldByNameClass( subformName )
            .find( "[data-subform-record-index='" + subformIndex + "']" );
    };
    var get$List = function(){
        return $( '#zcrud-list-department' );
        //return get$Container().find( '.zcrud-list' );
    };  
    
    var getCurrentList = function( options ){
        return  $( '#' + options.pageConf.pages.list.id );
    };
    
    var countVisibleRows = function( options ){
        //return getCurrentList( options ).find( '.zcrud-data-row:not(:hidden)' ).length;
        return getCurrentList( options ).find( '.zcrud-data-row:not(.zcrud-hidden)' ).length;
    };
    
    var countVisibleSubformRows = function( subformName ){
        //return get$FormFieldByNameClass( subformName ).find( '.zcrud-data-row:not(:hidden)' ).length;
        return get$FormFieldByNameClass( subformName ).find( '.zcrud-data-row:not(.zcrud-hidden)' ).length;
    };
    
    var pagingInfo = function( options ){
        return getCurrentList( options ).find( '.zcrud-page-info' ).html();
    };
    
    var getAllValues = function( selector ){
        return $( selector ).map( function( index, element ) {
            //return this.innerHTML;
            return this.innerText;
        } ).get().join( '/' );
    }
    
    var getAllFieldsValues = function( selector ){
        return $( selector ).find( 'input' ).map( function( index, element ) {
            return this.value;
        } ).get().join( '/' );
    };
    
    var getColumnValues = function( fieldId, isFormField ){
        
        return isFormField?
            getAllFieldsValues( '.' + 'zcrud-column-data-' + fieldId + ':not(:hidden)' ):
            getAllValues( '.' + 'zcrud-column-data-' + fieldId + ':not(:hidden)' );
    };
    
    var getPageListInfo = function( options ){
        
        var info = {
            notActive: [],
            active: []
        };
        
        getCurrentList( options ).find( '.zcrud-page-list' ).children().filter( ':visible' ).each( function( index ) {
            var $this = $( this );
            var id = $this.text().trim();
            
            if ( '...' === id ){
                return;    
            }
            
            var active = ! $this.hasClass( 'zcrud-page-number-disabled' );
            var currentList = active? info.active: info.notActive;
            currentList.push( id );
        });
            
        return info;
    };
    
    var checkPageListInfo = function( assert, options, expectedNotActiveArray, expectedActiveArray ){

        var info = getPageListInfo( options );
        assert.deepEqual( info.active, expectedActiveArray );
        assert.deepEqual( info.notActive, expectedNotActiveArray );
    };

    var goToPage = function( options, pageId ){
        
        var $page = getCurrentList( options ).find( '.zcrud-page-list' ).children().filter( 
            function() {
                return $( this ).text() == pageId;
            });
        $page.trigger( 'click' );
    };
    
    var getPageByClass  = function( options, cssClass ){
        return getCurrentList( options ).find( '.zcrud-page-list' ).children().filter( '.' + cssClass );
    };

    var triggerKeyPressed = function( $field, code ){
        
        var event = $.Event( 'keypress' );
        
        event.ctrlKey = false;
        event.shiftKey = false;
        event.altKey = false;
        event.keyCode = code;
        event.which = code;
        
        $field.trigger( event );
    };
    
    var goToPageUsingField = function( options, pageId ){
        
        var $field = get$BottomPanel().find( '.zcrud-go-to-page-field' );
        
        if ( options.pageConf.pages.list.components.paging.gotoPageFieldType == 'combobox' ){
            $field.val( pageId );
            $field.trigger( 'change' );
        } else if ( options.pageConf.pages.list.components.paging.gotoPageFieldType == 'textbox' ){
            $field.val( pageId );
            triggerKeyPressed( $field, 13 );
        } else {
            throw 'Invalid options.pageConf.pages.list.components.paging.gotoPageFieldType: ' + options.pageConf.pages.list.components.paging.gotoPageFieldType;
        }
    };
    
    var goToClass = function( options, cssClass ){
        getPageByClass( options, cssClass ).trigger( 'click' );
    };
    
    var goToNextPage = function( options ){
        goToClass( options, 'zcrud-page-number-next' );
    };

    var goToPreviousPage = function( options ){
        goToClass( options, 'zcrud-page-number-previous' );
    };
    
    var goToFirstPage = function( options ){
        goToClass( options, 'zcrud-page-number-first' );
    };
    
    var goToLastPage = function( options ){
        goToClass( options, 'zcrud-page-number-last' );
    };
    
    /*
    var changeSize = function( options, size ){
        var $combobox = $( '#' + options.pageConf.pages.list.components.paging.pageSizeChangeComboboxId );
        $combobox.val( size );
        $combobox.trigger( 'change' );
    };*/
    var changeSize = function( options, size ){
        var $field = get$BottomPanel().find( '.zcrud-page-size-change-field' );
        $field.val( size );
        $field.trigger( 'change' );
    };
    
    var filtering = function( options, filter ){
        var filterName = 'name';
        get$Filtering().find( "[name='" + filterName +"']" ).val( filter );
        get$Filtering().find( '.zcrud-filter-submit-button' ).trigger( 'click' );
    };
    
    var pagingTest = function( testOptions ){
        
        var assert = testOptions.assert;
        var options = testOptions.options;
        
        if ( testOptions.action ){
            if ( testOptions.action.pageId ){
                goToPage( options, testOptions.action.pageId );
            } else if ( testOptions.action.pageIdField ){
                goToPageUsingField( options, testOptions.action.pageIdField );
            } else if ( testOptions.action.nextPage ){
                goToNextPage( options );
            } else if ( testOptions.action.previousPage ){
                goToPreviousPage( options );
            } else if ( testOptions.action.firstPage ){
                goToFirstPage( options );
            } else if ( testOptions.action.lastPage ){
                goToLastPage( options );
            } else if ( testOptions.action.changeSize ){
                changeSize( options, testOptions.action.changeSize );
            } else if ( testOptions.action.filter != undefined ){
                filtering( options, testOptions.action.filter );
            }
        }
        
        assert.equal( countVisibleRows( options ), testOptions.visibleRows );
        assert.equal( pagingInfo( options ), testOptions.pagingInfo );
        if ( testOptions.ids ){
            assert.equal( getColumnValues( 'id', testOptions.editable ), testOptions.ids );
        }
        assert.equal( getColumnValues( 'name', testOptions.editable ), testOptions.names );
        checkPageListInfo( assert, options, testOptions.pageListNotActive, testOptions.pageListActive );
    };
    
    var multiplePagingTest = function( testOptions ){
        
        var assert = testOptions.assert;
        var options = testOptions.options;
        //var ids = testOptions.ids;
        //var names = testOptions.names;
        var values = testOptions.values;
        var c = 0;
        
        pagingTest({
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 1-10 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '<<', '<', '1' ],
            pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
        });
        pagingTest({
            action: { 
                pageId: '2' 
            },
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 11-20 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '2' ],
            pageListActive: [ '<<', '<', '1', '3', '4', '5', '13', '>', '>>' ]
        });
        pagingTest({
            action: { 
                nextPage: true
            },
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 21-30 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '3' ],
            pageListActive: [ '<<', '<', '1', '2', '4', '5', '13', '>', '>>' ]
        });
        pagingTest({
            action: { 
                previousPage: true
            },
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 11-20 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '2' ],
            pageListActive: [ '<<', '<', '1', '3', '4', '5', '13', '>', '>>' ]
        });
        pagingTest({
            action: { 
                firstPage: true
            },
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 1-10 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '<<', '<', '1' ],
            pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
        });
        pagingTest({
            action: { 
                lastPage: true
            },
            options: options,
            assert: assert,
            visibleRows: 9,
            pagingInfo: 'Showing 121-129 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '13', '>', '>>' ],
            pageListActive: [ '<<', '<', '1', '9', '10', '11', '12' ]
        });
        pagingTest({
            action: { 
                pageIdField: '8'
            },
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 71-80 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '8' ],
            pageListActive: [ '<<', '<', '1', '6', '7', '9', '10', '13', '>', '>>' ]
        });
        pagingTest({
            action: { 
                changeSize: '25'
            },
            options: options,
            assert: assert,
            visibleRows: 25,
            pagingInfo: 'Showing 1-25 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '<<', '<', '1' ],
            pageListActive: [ '2', '3', '4', '5', '6', '>', '>>' ]
        });
        pagingTest({
            action: { 
                nextPage: true
            },
            options: options,
            assert: assert,
            visibleRows: 25,
            pagingInfo: 'Showing 26-50 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '2' ],
            pageListActive: [ '<<', '<', '1', '3', '4', '5', '6', '>', '>>' ]
        });
        pagingTest({
            action: { 
                changeSize: '10'
            },
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 1-10 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '<<', '<', '1' ],
            pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
        });
    };
    /*
    var buildIdsList = function( start, end ){
        
        var result = '' + start;
        for ( var c = 1 + start; c <= end; ++c ){
            result += '/' + c;
        }
        return result;
    };
    
    var buildServicesList = function( start, end ){

        var result = 'Service ' + start;
        for ( var c = 1 + start; c <= end; ++c ){
            result += '/Service ' + c;
        }
        return result;
    };*/
    
    var buildValuesList = function( start, end ){

        var ids = '' + start;
        var services = 'Service ' + start;
        for ( var c = 1 + start; c <= end; ++c ){
            ids += '/' + c;
            services += '/Service ' + c;
        }
        
        var result = [];
        result.push( ids );
        result.push( services );
        return result;
    };
    
    var buildCustomValuesList = function( ){
        
        var ids = '';
        var services = '';
        var addSlash = false;
        for ( var c = 0, j = arguments.length; c < j; c++ ){
            if ( addSlash ){
                ids += '/';
                services += '/';
            }
            addSlash = true;
            var item = arguments[ c ];
            if ( ! $.isArray( item ) ){
                ids += item;
                services += 'Service ' + item;
            } else {
                ids += item[ 0 ];
                services += item[ 1 ];
            }
        }
        
        var result = [];
        result.push( ids );
        result.push( services );
        return result;
    };
    
    var keyEvent = function( key, event ){
        var e = $.Event( event, { which: key } );
        $( 'body' ).trigger( e );
    };
    var keyDown = function( key ){
        keyEvent( key, 'keydown' );
    };
    var keyUp = function( key ){
        keyEvent( key, 'keyup' );
    };
    
    var get$row = function( key ){
        
        if ( ! key ){
            alert( 'Error: null key in get$row method!' );
            return;
        }
        
        return get$Tbody().find( "[data-record-key='" + key + "']" );
    };
    var getLastRow = function(){
        return get$Tbody().find( 'tr.zcrud-data-row:last' );
        //return get$Tbody().find( 'tr:last' );
    };
    
    var getFieldValue = function( $selection ){
        return $selection.find( 'input' ).val();
    };
    
    var checkRecordInList = function( assert, key, expectedRecord, editable, noCheckId ){

        // Check record from ZCrud
        var record = get$Container().zcrud( 'getRecordByKey', key );
        //alert( JSON.stringify( record ) );
        assert.deepEqual( record, expectedRecord );

        // Check record from table
        var row = get$Tbody().find( "[data-record-key='" + key + "']" );
        var id = editable?
            getFieldValue ( row.find( "td.zcrud-column-data-id" ) ).trim():
        row.find( "td.zcrud-column-data-id" ).text().trim();
        var name = editable?
            getFieldValue ( row.find( "td.zcrud-column-data-name" ) ).trim():
        row.find( "td.zcrud-column-data-name" ).text().trim();
        if ( ! noCheckId ){
            assert.equal( id, expectedRecord.id );
        }
        assert.equal( name, expectedRecord.name );
    };
    
    var checkRecord = function( assert, key, expectedRecord, editable, checkOnlyStorage ){
        
        if ( ! checkOnlyStorage ){
            checkRecordInList( assert, key, expectedRecord, editable );
        }
        
        // Check record from storage
        assert.deepEqual( testUtils.getService( key ), expectedRecord );
    };
    
    var checkNoRecord = function( assert, key ){
        
        // Check record from ZCrud
        var record = get$Container().zcrud( 'getRecordByKey', key );
        assert.equal( record, undefined );

        // Check record from table
        var row = get$Tbody().find( "[data-record-key='" + key + "']" );
        assert.equal( row.length, 0 );
        
        // Check record from storage
        assert.equal( testUtils.getService( key ), undefined );
    };
    
    var clickRowButton = function( $row, cssClass ){
        $row.find( cssClass ).trigger( 'click' );
    };
    var clickListButton = function( key, cssClass ){

        clickRowButton(
            get$Tbody().find( "[data-record-key='" + key + "']" ),
            cssClass
        );
    };
    var clickDeleteListButton = function( key ){
        clickListButton( key, '.zcrud-delete-command-button' );
    };
    var clickUpdateListButton = function( key ){
        clickListButton( key, '.zcrud-edit-command-button' );
    };
    var clickDeleteRowListButton = function( key ){
        clickListButton( key, '.zcrud-delete-row-command-button' );
    };
    var clickLastDeleteRowListButton = function(){
        clickRowButton(
            getLastRow(),
            '.zcrud-delete-row-command-button'
        );
    };
    var clickCreateRowListButton = function(){
        get$List().find( '.zcrud-new-row-command-button' ).trigger( 'click' );
    };
    var clickCreateListButton = function(){
        get$List().find( '.zcrud-new-command-button' ).trigger( 'click' );
    };
    var clickFormCancelButton = function(){
        get$Form().find( '.zcrud-form-cancel-command-button' ).trigger( 'click' );
    };
    var clickFormSubmitButton = function(){
        get$Form().find( '.zcrud-form-submit-command-button' ).trigger( 'click' );
    };
    var clickCreateSubformRowButton = function( subformName ){
        get$FormFieldByNameClass( subformName ).find( '.zcrud-subform-new-row-command-button' ).trigger( 'click' );
    };
    var clickDeleteSubformRowButton = function( subformName, subformIndex ){
        get$FormFieldByNameClass( subformName )
            .find( "[data-subform-record-index='" + subformIndex + "'] .zcrud-subform-delete-row-command-button"  )
            .trigger( 'click' );
    };
    
    var getSaveButton = function(){
        return get$Container().find( '.zcrud-save-command-button' );
    };
    var clickEditableListSubmitButton = function(){
        getSaveButton().trigger( 'click' );
    };
    var saveEnabled = function(){
        return ! getSaveButton().prop( "disabled" );
    };
    
    var click$button = function( $button, times ){

        var timesToDo = times || 1;
        for( var c = 0; c < timesToDo; ++c ){
            $button.trigger( 'click' );
        }
    };
    
    var get$undoButton = function(){
        return get$Container().find( '.zcrud-undo-command-button' );
    };
    var clickUndoButton = function( times ){
        click$button( get$undoButton(), times );
    };
    var getNumberOfUndoActions = function(){
        return Number( get$undoButton().text().replace( /[^0-9]/g, "" ) );
    };
    
    var get$redoButton = function(){
        return get$Container().find( '.zcrud-redo-command-button' );
    };
    var clickRedoButton = function( times ){
        click$button( get$redoButton(), times );
    };
    var getNumberOfRedoActions = function(){
        return Number( get$redoButton().text().replace( /[^0-9]/g, "" ) );
    };
    
    var fillForm = function( record ){

        setFormVal( record, 'id' );
        setFormVal( record, 'name' );
        setFormVal( record, 'description' );
        setFormVal( record, 'date' );
        setFormVal( record, 'time' );
        setFormDatetimeVal( record, 'datetime' );
        setFormRadioVal( record, 'phoneType' );
        setFormVal( record, 'province' );
        setFormVal( record, 'city' );
        setFormVal( record, 'browser' );  
        setFormCheckboxVal( record, 'important' );  
        setFormVal( record, 'number' );
        fillSubform( record, 'members' );
    };

    var fillSubform = function( record, name ){

        var subformRecords = record[ name ];

        if ( subformRecords == undefined ){
            return;
        }
        
        for ( var index in subformRecords ){
            
            var subformRecord = subformRecords[ index ];
            //var $row = get$Form().find( "[data-subform-record-index='" + index + "']" );
            var $row = get$FormFieldByNameClass( name ).find( "[data-subform-record-index='" + index + "']" );
            fillSubformRow( subformRecord, $row, name );
        }
    };
    
    var fillSubformRow = function( subformRecord, $row, subformName ){
        
        setFormVal( subformRecord, 'code', $row, subformName );
        setFormVal( subformRecord, 'name', $row, subformName );
        setFormVal( subformRecord, 'description', $row, subformName );
        setFormVal( subformRecord, 'date', $row, subformName );
        setFormVal( subformRecord, 'time', $row, subformName );
        setFormDatetimeVal( subformRecord, 'datetime', $row, subformName );
        setFormRadioVal( subformRecord, 'phoneType', $row, subformName );
        setFormVal( subformRecord, 'province', $row, subformName );
        setFormVal( subformRecord, 'city', $row, subformName );
        setFormVal( subformRecord, 'browser', $row, subformName );
        setFormCheckboxVal( subformRecord, 'important', $row, subformName );
        setFormVal( subformRecord, 'number', $row, subformName );
    };
    
    var fillSubformNewRow = function( subformRecord, subformName ){
        
        fillSubformRow( 
            subformRecord, 
            getSubformLastRow( subformName ), 
            subformName );
    };
    
    var getSubformLastRow = function( subformName ){
        return get$FormFieldByNameClass( subformName ).find( 'tr.zcrud-data-row:last' );
    };
    
    var isVoid = function( value ){
        return value == undefined || value == '';
    };

    var areEquivalent = function( value1, value2 ){

        var value1IsVoid = isVoid( value1 );
        var value2IsVoid = isVoid( value2 );

        return value1IsVoid || value2IsVoid? value1IsVoid && value2IsVoid: value1 === value2;
    };
    
    var checkForm = function( assert, record ){
        
        assert.ok( 
            areEquivalent( 
                getFormVal( 'id' ), record.id ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'name' ), record.name ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'description' ), record.description ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'date' ), record.date ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'time' ), record.time ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'datetime' ), record.datetime ) );
        assert.ok( 
            areEquivalent( 
                getFormRadioVal( 'phoneType' ), record.phoneType ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'province' ), record.province ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'city' ), record.city ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'browser' ), record.browser ) );
        assert.ok( 
            areEquivalent( 
                getFormCheckboxVal( 'important' ), record.important ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'number' ), record.number ) );
        assert.deepEqual( getSubformVal( 'members' ), record.members );
    };
    
    var checkViewField = function( assert, id, record, $form ){
        assert.equal( 
            $form.find( '.zcrud-field-' + id + ' .zcrud-property' ).html(),
            record[ id ] );
    };
    
    var checkDeleteForm = function( assert, record ){
        
        var $form = get$Form();
        
        checkViewField( assert, 'id', record, $form );
        checkViewField( assert, 'name', record, $form );
        checkViewField( assert, 'description', record, $form );
        checkViewField( assert, 'date', record, $form );
        checkViewField( assert, 'time', record, $form );
        checkViewField( assert, 'datetime', record, $form );
        checkViewField( assert, 'phoneType', record, $form );
        checkViewField( assert, 'province', record, $form );
        checkViewField( assert, 'city', record, $form );
        checkViewField( assert, 'browser', record, $form );
        checkViewField( assert, 'important', record, $form );
        checkViewField( assert, 'number', record, $form );
        
        //assert.deepEqual( getSubformVal( 'members' ), record.members );
    };
    
    var setFormCheckboxVal = function( record, name, $row, subformName ){
        
        if ( record[ name ] === undefined ){
            return;
        }
        
        var $element = $row || get$Form();
        $element.find( "input:checkbox[name='" + buildElementName( name, subformName ) +"']" )
            .prop( 'checked', record[ name ] )
            .trigger( 'change' )
            .trigger( 'blur' );
    };
    
    var setFormRadioVal = function( record, name, $row, subformName ){
        
        if ( record[ name ] === undefined ){
            return;
        }
        
        var $element = $row || get$Form();
        var rowIndex = $row? $row.index() - 1: 0;
        var nameAttr = name + '[' + rowIndex + ']';
        $element.find( "input:radio[name='" + buildElementName( nameAttr, subformName ) +"']" ).filter( '[value=' + record[ name ] + ']' )
            .prop( 'checked', true )
            .trigger( 'change' )
            .trigger( 'blur' );
    };
    
    var setFormVal = function( record, name, $row, subformName ){
        
        if ( record[ name ] === undefined ){
            return;
        }
        
        var $element = $row || get$Form();
        $element.find( "[name='" + buildElementName( name, subformName ) +"']" )
            .val( record[ name ] )
            .trigger( 'change' )
            .trigger( 'blur' );
    };
    
    var setFormDatetimeVal = function( record, name, $row, subformName ){
        
        if ( record[ name ] === undefined ){
            return;
        }
        
        var $element = $row || get$Form();
        $element.find( "[name='" + buildElementName( name, subformName ) +"']" )
            .val( record[ name ] )
            .trigger( 'change' );
    };
    
    var getFormVal = function( name, $row, subformName ){
        
        var $element = $row || get$Form();
        return $element.find( "[name='" + buildElementName( name, subformName ) +"']" ).val();
    };
    
    var getFormRadioVal = function( name, $row, subformName ){

        var $element = $row || get$Form();
        var rowIndex = $row? $row.index() - 1: 0;
        var nameAttr = name + '[' + rowIndex + ']';
        var $selected = $element.find( "input:radio[name='" + buildElementName( nameAttr, subformName ) +"']:checked" );
        return $selected? $selected.val(): undefined;
    };
    
    var getFormCheckboxVal = function( name, $row, subformName ){

        var $element = $row || get$Form();
        return $element.find( "input:checkbox[name='" + buildElementName( name, subformName ) +"']" ).prop( 'checked' );
    };

    var buildElementName = function( name, subformName ){
        return subformName? subformName + context.subformSeparator + name: name;
    };
    
    var getSelectOptions = function( name, $row ){

        var result = [];
        var $element = $row || get$Form();

        // Can not use :visible, it does not work in Chrome
        //$element.find( "[name='" + name +"'] option:visible" ).each( function() {
        $element.find( "[name='" + name +"'] option" ).each( function() {
            var value = $( this ).val();
            if ( value && value.trim() !== defaultOptionValue ){
                result.push( value );
            }
        });

        return result;
    };
    
    var getSubformVal = function( name, $row ){
        
        var $element = $row || get$Form();
        var $field = $element.find( ".zcrud-field-" + name );
        
        if ( $field.length === 0 ){
            return undefined;
        }
        
        var result = [];
        $field
            .find( ".zcrud-data-row:not(.zcrud-hidden)" )
            .each( function() {
            
                var $this = $( this );
                var row = {};
                result.push( row );

                /*
                row[ 'code' ] = getFormVal( 'code', $this, name );
                row[ 'name' ] = getFormVal( 'name', $this, name );
                row[ 'description' ] = getFormVal( 'description', $this, name );
                */
                putSubformVal( row, 'code', getFormVal( 'code', $this, name ) );
                putSubformVal( row, 'name', getFormVal( 'name', $this, name ) );
                putSubformVal( row, 'description', getFormVal( 'description', $this, name ) );
                putSubformVal( row, 'date', getFormVal( 'date', $this, name ) );
                putSubformVal( row, 'time', getFormVal( 'time', $this, name ) );
                putSubformVal( row, 'datetime', getFormVal( 'datetime', $this, name ) );
                putSubformVal( row, 'phoneType', getFormRadioVal( 'phoneType', $this, name ) );
                putSubformVal( row, 'province', getFormVal( 'province', $this, name ) );
                putSubformVal( row, 'city', getFormVal( 'city', $this, name ) );
                putSubformVal( row, 'browser', getFormVal( 'browser', $this, name ) );
                putSubformVal( row, 'important', getFormCheckboxVal( 'important', $this, name ) );
                putSubformVal( row, 'number', getFormVal( 'number', $this, name ) );
        });
        
        return result;
    };
    
    var putSubformVal = function( row, id, value ){
        
        if ( value != undefined ){
            row[ id ] = value;
        }
    };
    
    var fill = function( record, $row ){
        
        setFormVal( record, 'id', $row );
        setFormVal( record, 'name', $row );
        setFormVal( record, 'description', $row );
        setFormVal( record, 'date', $row );
        setFormVal( record, 'time', $row );
        setFormDatetimeVal( record, 'datetime', $row );
        setFormRadioVal( record, 'phoneType', $row );
        setFormVal( record, 'province', $row );
        setFormVal( record, 'city', $row );
        setFormVal( record, 'browser', $row );
        setFormCheckboxVal( record, 'important', $row );
        setFormVal( record, 'number', $row );
    };
    
    var fillNewRowEditableList = function( record ){
        fill( record, getLastRow() );
    };
    
    var fillEditableList = function( record, id ){
        fill( record, get$row( id ) );
    };
    
    var checkEditableListRow = function( assert, record, $row ){

        if ( record.id !== undefined ){
            assert.equal( getFormVal( 'id', $row ), record.id );
        }
        if ( record.name !== undefined ){
            assert.equal( getFormVal( 'name', $row ), record.name );
        }
        if ( record.description !== undefined ){
            assert.equal( getFormVal( 'description', $row ), record.description );
        }
        if ( record.date !== undefined ){
            assert.equal( getFormVal( 'date', $row ), record.date );
        }
        if ( record.time !== undefined ){
            assert.equal( getFormVal( 'time', $row ), record.time );
        }
        if ( record.datetime !== undefined ){
            assert.equal( getFormVal( 'datetime', $row ), record.datetime );
        }
        if ( record.phoneType !== undefined ){
            assert.equal( getFormRadioVal( 'phoneType', $row ), record.phoneType );
        }
        if ( record.province !== undefined ){
            assert.equal( getFormVal( 'province', $row ), record.province );
        }
        if ( record.city !== undefined ){
            assert.equal( getFormVal( 'city', $row ), record.city );
        }
        if ( record.browser !== undefined ){
            assert.equal( getFormVal( 'browser', $row ), record.browser );
        }
        if ( record.important !== undefined ){
            assert.equal( getFormCheckboxVal( 'important', $row ), record.important );
        }
        if ( record.number !== undefined ){
            assert.equal( getFormVal( 'number', $row ), record.number );
        }
    };
    
    var checkEditableListLastRow = function( assert, record ){
        checkEditableListRow( assert, record, getLastRow() );
    };
    
    var checkEditableListForm = function( assert, id, record ){
        checkEditableListRow( assert, record, get$row( id ) );
    };
    
    var assertHistory = function( assert, expectedUndoActions, expectedRedoActions, expectedSaveEnabled ){
        assert.equal( getNumberOfUndoActions(), expectedUndoActions );
        assert.equal( getNumberOfRedoActions(), expectedRedoActions );
        //assert.equal( saveEnabled(), expectedSaveEnabled );
    };
    
    var getNumberOfValidationErrors = function( customErrorClass ){
        var errorClass = customErrorClass || 'error';
        return $( '.' + errorClass ).length;
    };
    
    var getDatetimePicker = function( index ){
        //return $( '.datepicker .active' );
        return $( ".datetime:eq( " + index + " )" );
    };
    
    var togglePicker = function( $field ){
        $field.find( '.toggle-picker' ).click();
    };
    
    var getDatetimeYear = function( $field ){
        return $field
            .find( '[name="datepicker-year"]' )
            .val();
    };
    var setDatetimeYear = function( $field, year ){
        $field
            .find( '[name="datepicker-year"]' )
            .val( year )
            .trigger( 'change' );
    };
    
    var getDatetimeMonth = function( $field ){
        return $field
            .find( '[name="datepicker-month"]' )
            .val();
    };
    var setDatetimeMonth = function( $field, month ){
        $field
            .find( '[name="datepicker-month"]' )
            .val( month )
            .trigger( 'change' );
    };
    
    var setDatetimeDay = function( $field, day ){
        $field.find( "td .date[data-date='" + day + "']"  ).click();
    };
    
    var getDatetimeHours = function( $field ){
        return $field
            .find( '.timepicker .hours' )
            .text();
    };
    var setDatetimeHours = function( $field, hours ){
        setDatetimeTimeValue( 
            $field, 
            hours, 
            parseInt( getDatetimeHours( $field ) ), 
            'hour',
            1 );
    };
    
    var getDatetimeMinutes = function( $field ){
        return $field
            .find( '.timepicker .minutes' )
            .text();
    };
    var setDatetimeMinutes = function( $field, hours, field ){
        setDatetimeTimeValue( 
            $field, 
            hours, 
            parseInt( getDatetimeMinutes( $field ) ), 
            'minute',
            field.customOptions.minutesStep );
    };
    
    var setDatetimeTimeValue = function( $field, value, current, classPart, step ){

        var clicks = Math.abs( value - current ) / step;
        if ( clicks == 0 ){
            return;
        }

        var className = value > current? '.next-' + classPart: '.prev-' + classPart;
        var $button = $field.find( '.timepicker ' + className );

        for( var c = 0; c < clicks; ++c ){
            $button
                .mousedown()
                .mouseup();
        }
    };
    
    var clickDatetimeOK = function( $field ){
        $field.find( '.save-button:visible' ).click();
    };
    
    var updateDatetimePickerInForm = function( fieldName, field, stringValue ){

        updateDatetimePickerFrom$field( 
            get$FormFieldByNameClass( fieldName ), 
            field, 
            stringValue );
    };
    
    var updateDatetimePickerInSubform = function( subformName, fieldName, subformIndex, field, stringValue ){
        
        updateDatetimePickerFrom$field( 
            get$SubFormFieldByNameClass( subformName, fieldName, subformIndex ), 
            field, 
            stringValue );
    };
    
    var updateDatetimePickerInList = function( rowId, fieldName, field, stringValue ){
        
        updateDatetimePickerFrom$field( 
            get$row( rowId ).find( ".zcrud-column-data-" + fieldName ), 
            field, 
            stringValue );
    };
    
    var updateLastRowDatetimePickerInList = function( fieldName, field, stringValue ){

        updateDatetimePickerFrom$field( 
            getLastRow().find( ".zcrud-column-data-" + fieldName ), 
            field, 
            stringValue );
    };
    
    var updateDatetimePickerFrom$field = function( $field, field, stringValue ){

        var instance = 
            field.type == 'time'? 
            datetimeFieldManager.buildTimeObjectFromString( field, stringValue ):
        datetimeFieldManager.getValueFromString( stringValue, field );

        if ( ! field.customOptions.inline ){
            togglePicker( $field );
        }

        if ( field.type == 'datetime' || field.type == 'date' ){
            if ( instance.getFullYear() != getDatetimeYear( $field ) ){
                setDatetimeYear( $field, instance.getFullYear() );
            }
            if ( instance.getMonth() != getDatetimeMonth( $field ) ){
                setDatetimeMonth( $field, instance.getMonth() );
            }
            setDatetimeDay( $field, instance.getDate() );
        }

        if ( field.type == 'datetime' || field.type == 'time' ){
            var hours = field.type == 'time'? instance.hours: instance.getHours();
            var minutes = field.type == 'time'? instance.minutes: instance.getMinutes();
            setDatetimeHours( $field, hours );
            setDatetimeMinutes( $field, minutes, field );
        }

        if ( ! field.customOptions.inline ){
            clickDatetimeOK( $field );
        }
    };
    /*
    var updateDatetimePicker = function( subformName, fieldName, subformIndex, field, stringValue ){

        var $field = get$SubFormFieldByNameClass( subformName, fieldName, subformIndex );
        var instance = 
            field.type == 'time'? 
            datetimeFieldManager.buildTimeObjectFromString( field, stringValue ):
        datetimeFieldManager.getValueFromString( stringValue, field );

        if ( ! field.customOptions.inline ){
            togglePicker( $field );
        }

        if ( field.type == 'datetime' || field.type == 'date' ){
            if ( instance.getFullYear() != getDatetimeYear( $field ) ){
                setDatetimeYear( $field, instance.getFullYear() );
            }
            if ( instance.getMonth() != getDatetimeMonth( $field ) ){
                setDatetimeMonth( $field, instance.getMonth() );
            }
            setDatetimeDay( $field, instance.getDate() );
        }

        if ( field.type == 'datetime' || field.type == 'time' ){
            var hours = field.type == 'time'? instance.hours: instance.getHours();
            var minutes = field.type == 'time'? instance.minutes: instance.getMinutes();
            setDatetimeHours( $field, hours );
            setDatetimeMinutes( $field, minutes, field );
        }

        if ( ! field.customOptions.inline ){
            clickDatetimeOK( $field );
        }
    };*/
    
    var clickDatetimePickerDay = function( day ){
        
        //getDatetimePicker( index )
        //$( ".datetime .calendar td [data-date='" + day + "'] div" )
        $( "td.date[data-date='" + day + "']" ).click();
        //$( "[data-date='" + day + "'] div" ).click();
            //.trigger( 'click' );
        /*
            .filter(
                function() {
                    return $( this ).text() === "" + day; 
                }).trigger( 'click' );*/
    };
    
    return {
        countVisibleRows: countVisibleRows,
        countVisibleSubformRows: countVisibleSubformRows,
        pagingInfo: pagingInfo,
        getColumnValues: getColumnValues,
        //getPageListInfo: getPageListInfo,
        checkPageListInfo: checkPageListInfo,
        goToPage: goToPage,
        pagingTest: pagingTest,
        multiplePagingTest: multiplePagingTest,
        //buildIdsList: buildIdsList,
        //buildServicesList: buildServicesList,
        buildValuesList: buildValuesList,
        buildCustomValuesList: buildCustomValuesList,
        getCurrentList: getCurrentList,
        keyDown: keyDown,
        keyUp: keyUp,
        checkRecordInList: checkRecordInList,
        checkRecord: checkRecord,
        checkNoRecord: checkNoRecord,
        clickDeleteListButton: clickDeleteListButton,
        clickDeleteRowListButton: clickDeleteRowListButton,
        clickLastDeleteRowListButton: clickLastDeleteRowListButton,
        clickUpdateListButton: clickUpdateListButton,
        clickCreateListButton: clickCreateListButton,
        clickCreateRowListButton: clickCreateRowListButton,
        clickFormCancelButton: clickFormCancelButton,
        clickFormSubmitButton: clickFormSubmitButton,
        fillForm: fillForm,
        checkForm: checkForm,
        checkDeleteForm: checkDeleteForm,
        fillEditableList: fillEditableList,
        fillNewRowEditableList: fillNewRowEditableList,
        checkEditableListForm: checkEditableListForm,
        checkEditableListLastRow: checkEditableListLastRow,
        clickEditableListSubmitButton: clickEditableListSubmitButton,
        clickUndoButton: clickUndoButton,
        clickRedoButton: clickRedoButton,
        assertHistory: assertHistory,
        setFormVal: setFormVal,
        get$row: get$row,
        getLastRow: getLastRow,
        getSelectOptions: getSelectOptions,
        fillSubform: fillSubform,
        fillSubformNewRow: fillSubformNewRow,
        clickCreateSubformRowButton: clickCreateSubformRowButton,
        clickDeleteSubformRowButton: clickDeleteSubformRowButton,
        getNumberOfValidationErrors: getNumberOfValidationErrors,
        get$FormFieldByNameClass: get$FormFieldByNameClass,
        get$SubFormFieldByNameClass: get$SubFormFieldByNameClass,
        clickDatetimePickerDay: clickDatetimePickerDay,
        //togglePicker: togglePicker,
        //setDatetimeYear: setDatetimeYear,
        //setDatetimeMonth: setDatetimeMonth,
        //setDatetimeDay: setDatetimeDay,
        //clickDatetimeOK: clickDatetimeOK,
        updateDatetimePickerInForm: updateDatetimePickerInForm,
        updateDatetimePickerInSubform: updateDatetimePickerInSubform,
        updateDatetimePickerInList: updateDatetimePickerInList,
        updateLastRowDatetimePickerInList: updateLastRowDatetimePickerInList,
        get$SubFormFieldRow: get$SubFormFieldRow,
        goToLastPage: goToLastPage
    };
})();
