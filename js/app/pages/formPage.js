/* 
    Class FormPage
*/
module.exports = function ( optionsToApply, type ) {
    "use strict";
    
    var context = require( '../context.js' );
    var pageUtils = require( './pageUtils.js' );
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    
    var self = this;
    var options = optionsToApply;
    var dictionary = undefined;
    var record = undefined;
    var template = undefined;
    var submitFunction = undefined;
    var cancelFunction = undefined;
    /*
    var defaultFormAjaxOptions = {
        dataType   : 'json',
        contentType: 'application/json; charset=UTF-8',
        type       : 'POST'
    };*/
    
    // Configure instance depending on type parameter
    var configure = function(){
        options.currentForm = {};
        options.currentForm.type = type;
        switch( type ) {
        case 'create':
            template = options.createTemplate;
            options.currentForm.title = "Create form";
            submitFunction = submitCreateForm;
            cancelFunction = cancelForm;
            options.currentForm.fields = buildFields(
                function( field ){
                    return field.create;
                });
            break;
        case 'update':
            template = options.updateTemplate;
            options.currentForm.title = "Edit form";
            submitFunction = submitUpdateForm;
            cancelFunction = cancelForm;
            options.currentForm.fields = buildFields(
                function( field ){
                    return field.edit;
                });
            break;
        case 'delete':
            template = options.deleteTemplate;
            options.currentForm.title = "Delete form";
            submitFunction = submitDeleteForm;
            cancelFunction = cancelForm;
            options.currentForm.fields = buildFields(
                function( field ){
                    return field.delete;
                });
            break; 
        default:
            throw "Unknown FormPage type: " + type;
        }
    };
    
    var buildFields = function( filterFunction ){
        var fields = [];
        
        for ( var c = 0; c < options.fields.length; c++ ) {
            var field = options.fields[ c ];
            var filtered = filterFunction( field );
            
            if ( options.key == field.id && ! filtered ) {
                continue;
            }
            if ( filtered == false ){
                continue;
            }
            fields.push( field );
        }
        
        return fields;
    };
    
    // Main method
    var show = function(){
        updateDictionary();
        buildHTMLAndJavascript();
    };
    
    // Set and get record
    var setRecord = function( recordToApply ){
        record = recordToApply;
    };
    var getRecord = function(){
        return record;
    };
    var updateRecord = function(){
        record = {};
        
        for ( var c = 0; c < options.currentForm.fields.length; c++ ) {
            var field = options.currentForm.fields[ c ];
            record[ field.id ] = $( '#zcrud-' + field.id ).val();
        }
    };
    
    var buildHTMLAndJavascript = function(){
        
        if ( ! record ){
            throw "No record set in form!";
        }
        
        pageUtils.configureTemplate( options, template );
        
        zpt.run({
            //root: options.target[0],
            root: options.body,
            dictionary: dictionary,
            callback: addButtonsEvents
        });
    };
    
    var updateDictionary = function(){
        
        dictionary = {
            options: options,
            record: record
        };
    };
    
    var addButtonsEvents = function() {

        var submitButton = $( '#form-submit-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                submitFunction( event );
            });
        var cancelButton = $( '#form-cancel-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                cancelFunction( event );
            });
    };
    
    var submitCreateForm = function( event ){
        //alert( 'submitCreateForm' );
        
        submitCreateAndUpdateForms( 
            event, 
            'create', 
            options.messages.createSuccess );
    };
    
    var submitUpdateForm = function( event ){
        //alert( 'submitUpdateForm' );
        
        submitCreateAndUpdateForms( 
            event, 
            'update', 
            options.messages.updateSuccess );
    };
    
    var submitCreateAndUpdateForms = function( event, command, successMessage ){
        //alert( 'submitCreateForm' );
        
        updateRecord();
        
        var dataToSend = {
            command: command,
            records: [ record ]
        };
        
        var thisOptions = {
            url        : options.actions.createAction,
            data       : options.ajaxPreFilter( dataToSend ),
            success    : function ( data ) {
                data = options.ajaxPostFilter( data );
                context.getMainPage().show({
                        status: {
                            message: successMessage,
                            date: new Date().toLocaleString()
                        }
                });
            },
            error      : function ( data ) {
                data = options.ajaxPostFilter( data );
                context.showError( options.messages.serverCommunicationError );
            }
        };
        
        options.ajax(
            $.extend( {}, options.defaultFormAjaxOptions, thisOptions ) );
    };
    
    var submitDeleteForm = function( event ){
        //alert( 'submitDeleteForm' );
        context.getMainPage().show();
    };
    
    var cancelForm = function( event ){
        //alert( 'cancelForm' );
        context.getMainPage().show();
    };
    
    configure();
    
    return {
        show: show,
        setRecord: setRecord,
        getRecord: getRecord
    };
};