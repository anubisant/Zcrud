/* 
    EditingComponent class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );
var Component = require( './component.js' );
var pageUtils = require( '../pages/pageUtils.js' );
var History = require( '../history/history.js' );
var crudManager = require( '../crudManager.js' );
var validationManager = require( '../validationManager.js' );
var fieldUtils = require( '../fields/fieldUtils.js' );

var EditingComponent = function( optionsToApply, thisOptionsToApply, listPageToApply ) {
    
    Component.call( this, optionsToApply, thisOptionsToApply, listPageToApply );
    
    this.listPage = listPageToApply;
    this.autoSubmitMode = false;
    
    context.setHistory( 
        new History( 
            this.options, 
            this.thisOptions, 
            this.listPage ) );
};
Component.doSuperClassOf( EditingComponent );

EditingComponent.prototype.bindEvents = function(){

    var $this = $( '#' + this.listPage.getId() );

    // Init autoSubmitMode
    /*
        var editableEvent = thisOptions.event;
        switch ( editableEvent ){
            case 'fieldChange':
                autoSubmitMode = true;
                break;
            case 'batch':
                autoSubmitMode = false;
                break;
            default:
                context.showError( options, true, 'Unknown event in editable list: ' + editableEvent );
                return;
        }*/

    // Register change of the field
    this.bindEventsInRows( $this );

    // Setup validation
    var formId = this.listPage.getThisOptions().formId;
    validationManager.initFormValidation( 
        formId, 
        $( '#' + formId ), 
        this.options );
};

EditingComponent.prototype.bindEventsInRows = function( $preselection, record ){

    var instance = this;
    $preselection
        .find( '.zcrud-column-data input.historyField, .zcrud-column-data textarea.historyField, .zcrud-column-data select.historyField' )
        .change( 
        function ( event, disableHistory ) {
            if ( disableHistory ){
                return;
            }
            var $this = $( this );
            var field = instance.listPage.getFieldByName( $this.prop( 'name' ) );
            var $tr = $this.closest( 'tr' );
            context.getHistory().putChange( 
                $this, 
                field.getValue( $this ),
                $tr.attr( 'data-record-index' ),
                $tr.attr( 'data-record-id' ),
                instance.listPage.getId(),
                field );
            if ( instance.autoSubmitMode ){
                instance.submit.call( instance, event );
            }
        }
    );

    this.listPage.bindButtonsEvent( this.listPage.getByRowButtons() );

    // Bind events for fields
    var dictionary = this.listPage.getDictionary();
    var fields = this.listPage.getFields();

    if ( record ){
        this.bindEventsForFieldsAnd1Record( 
            fields, 
            dictionary, 
            record, 
            $preselection );
    } else {
        this.bindEventsForFieldsAndAllRecords( 
            fields, 
            dictionary,
            dictionary.records );
    }
};

EditingComponent.prototype.bindEventsForFieldsAndAllRecords = function( fields, dictionary, records ){

    var $rows = $( '#' + this.listPage.getThisOptions().tbodyId ).children().filter( '.zcrud-data-row' );
    for ( var i = 0; i < records.length; i++ ) {
        var record = records[ i ];
        this.bindEventsForFieldsAnd1Record( 
            fields, 
            dictionary, 
            record, 
            $rows.filter( ":eq(" + i + ")" ) );
    }
};

EditingComponent.prototype.bindEventsForFieldsAnd1Record = function( fields, dictionary, record, $row ){

    for ( var c = 0; c < fields.length; c++ ) {
        var field = fields[ c ];
        field.afterProcessTemplateForField(
            this.buildProcessTemplateParams( field, record, dictionary ),
            $row
        );
    }
};

EditingComponent.prototype.buildProcessTemplateParams = function( field, record, dictionary ){

    return {
        field: field, 
        value: record[ field.id ],
        options: this.options,
        record: record,
        source: 'update',
        dictionary: dictionary
    };
};

EditingComponent.prototype.deleteRow = function( event ){

    var $tr = $( event.target ).closest( 'tr' );

    context.getHistory().putDelete( 
        this.listPage.getId(), 
        $tr.attr( 'data-record-id' ),
        $tr.attr( 'data-record-index' ), 
        $tr.attr( 'data-record-key' ), 
        $tr );

    if ( this.autoSubmitMode ){
        this.submit( event );
    }
};

EditingComponent.prototype.addNewRow = function( event ){

    var newRecord = fieldUtils.buildDefaultValuesRecord( this.listPage.getFields() );
    var thisDictionary = this.buildDictionaryForNewRow( newRecord );

    var createHistoryItem = context.getHistory().putCreate( 
        this.listPage.getId(), 
        thisDictionary,
        $( '#' + this.listPage.getThisOptions().tbodyId ),
        newRecord );
    var $tr = createHistoryItem.get$Tr();

    // Bind events
    this.bindEventsInRows( $tr, newRecord );
    validationManager.initFormValidation( 
        this.listPage.getThisOptions().formId, 
        $tr, 
        this.options );
};

EditingComponent.prototype.buildDictionaryForNewRow = function( newRecord ){

    var thisDictionary = $.extend( true, {}, this.listPage.getDictionary() );

    thisDictionary.records = [ newRecord ];
    thisDictionary.editable = true;

    return thisDictionary;
};

// History methods
EditingComponent.prototype.undo = function( event ){

    context.getHistory().undo( this.listPage.getId() );
    /*
        if ( autoSubmitMode ){
            submit( event );
        }*/
};
EditingComponent.prototype.redo = function( event ){

    context.getHistory().redo( this.listPage.getId() );
    /*
        if ( autoSubmitMode ){
            submit( event );
        }*/
};

EditingComponent.prototype.submit = function( event ){

    var instance = this;
    var jsonObject = context.getJSONBuilder( this.options ).buildJSONForAll(
        this.thisOptions.key || this.options.key, 
        this.listPage.getDictionary().records,
        this.listPage.getFields(),
        undefined,
        context.getHistory() );

    // Return if there is no operation to do
    if ( ! jsonObject ){
        context.showError( this.options, false, 'No operation to do!' );
        return false;
    }

    var newJSONObject = {
        existingRecords: jsonObject.existingRecords,
        newRecords: jsonObject.newRecords,
        recordsToRemove: jsonObject.recordsToRemove,
        success: function( dataFromServer ){

            // Check server side validation
            if ( ! dataFromServer || dataFromServer.result != 'OK' ){
                pageUtils.serverSideError( dataFromServer, instance.options, context, undefined );
                return false;
            }
            instance.listPage.showStatusMessage({
                status:{
                    message: 'listUpdateSuccess',
                    date: new Date().toLocaleString()   
                }
            });

            // Update records in list and update paging component
            var delta = instance.updateRecords( jsonObject, dataFromServer );
            var pagingComponent = instance.listPage.getSecureComponent( 'paging' );
            if ( pagingComponent ){
                pagingComponent.dataFromClient( delta );
            }
            instance.listPage.updateBottomPanel();

            instance.updateKeys( 
                context.getHistory().getAllTr$FromCreateItems(), 
                dataFromServer.newRecords );
            context.getHistory().reset( instance.listPage.getId() );

        },
        error: function( request, status, error ){
            pageUtils.ajaxError( request, status, error, instance.options, context, undefined );
        },
        url: this.thisOptions.url
    };

    crudManager.batchUpdate( 
        newJSONObject, 
        this.options, 
        event,
        {
            $form: this.listPage.get$form(),
            formType: 'list',
            dataToSend: newJSONObject,
            options: this.options
        }
    );

    return jsonObject;
};

EditingComponent.prototype.updateRecords = function( jsonObjectToSend, dataFromServer ){

    var delta = 0;
    var records = this.listPage.getRecords();

    // Update all existing records
    for ( var key in jsonObjectToSend.existingRecords ) {
        var modifiedRecord = jsonObjectToSend.existingRecords[ key ];
        var currentRecord = records[ key ];
        var newKey = modifiedRecord[ this.options.key ];
        var extendedRecord = $.extend( true, {}, currentRecord, modifiedRecord );

        var currentKey = key;
        if ( newKey && key !== newKey ){
            delete records[ key ];
            key = newKey;
        }
        this.listPage.updateRecord( currentKey, extendedRecord );
        this.triggerEvent( 
            this.options.events.recordUpdated, 
            records[ key ], 
            dataFromServer );
    }

    // Add all new records using dataFromServer
    for ( var index in dataFromServer.newRecords ) {
        ++delta;
        var newRecord = dataFromServer.newRecords[ index ];
        key = newRecord[ this.options.key ];
        this.listPage.addRecord( key, newRecord );
        this.triggerEvent( 
            this.options.events.recordAdded, 
            newRecord, 
            dataFromServer );
    }

    // Remove all records to remove
    for ( var c = 0; c < jsonObjectToSend.recordsToRemove.length; c++ ) {
        --delta;
        key = jsonObjectToSend.recordsToRemove[ c ];
        var deletedRecord = $.extend( true, {}, records[ key ] );
        this.listPage.deleteRecord( key );
        this.triggerEvent( 
            this.options.events.recordDeleted, 
            deletedRecord, 
            dataFromServer );
    }

    return delta;
};

EditingComponent.prototype.triggerEvent = function( eventFunction, record, dataFromServer ){

    eventFunction({
        record: record,
        serverResponse: dataFromServer,
        options: this.options
    });
};

EditingComponent.prototype.updateKeys = function( $trArray, records ){

    if ( $trArray.length != records.length ){
        context.showError( 
            this.options, 
            true, 
            'Error trying to update keys: $trArray and records length does not match!' );
        return;    
    }

    var field = this.listPage.getField( this.options.key );

    for ( var c = 0; c < records.length; ++c ){
        var record = records[ c ];
        var $tr = $trArray[ c ];
        var value = record[ this.options.key ];

        // Update key value of field
        if ( field ){
            $tr.find( "[name='" + field.id + "']").val( value );
        }

        // Update key value in attribute of $tr
        $tr.attr( 'data-record-key', value );
    }
};

EditingComponent.prototype.removeChanges = function(){
    context.getHistory().reset( this.listPage.getId() );
};

module.exports = EditingComponent;
