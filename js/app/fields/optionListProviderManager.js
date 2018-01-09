/*
    OptionListProviderManager singleton class
*/
"use strict";

var context = require( '../context.js' );
var $ = require( 'jquery' );
var zpt = require( 'zpt' );

var OptionListProviderManager = function() {
    
    var cache = {};
    
    var getOptionsFromRecord = function( record, field, options ){
        
        var params = {
            field: field, 
            value: record[ field.id ],
            options: options,
            record: record
            //source: 'update'
            //dictionary: dictionary
        };
        params.dependedValues = createDependedValuesUsingRecord( record, field );
        
        return buildOptions( params );
    };
    /*
    var beforeProcessTemplateForField = function( params ){
        
        switch( params.source ) {
        case 'create':
        case 'update':
            beforeProcessTemplateForFieldInCreateOrUpdate( params );
            break;
        case 'delete':
            // Nothing to do
            break; 
        default:
            throw "Unknown source in OptionListProviderManager: " + params.source;
        }
    };
    
    var beforeProcessTemplateForFieldInCreateOrUpdate = function( params ){
        params.dependedValues = createDependedValuesUsingRecord( params );
        buildOptions( params );
    };*/
    
    var buildOptions = function( params ){
        
        var optionsSource = params.field.options;
        var funcParams = params;
        
        // Check if it is a function
        if ( $.isFunction( optionsSource ) ) {
            //prepare parameter to the function
            funcParams = $.extend( true, {
                _cacheCleared: false,
                dependedValues: {},
                clearCache: function () {
                    this._cacheCleared = true;
                }
            }, funcParams );

            //call function and get actual options source
            optionsSource = optionsSource( funcParams );
        }
        
        //Build options according to it's source type
        var optionsList = undefined;
        if ( typeof optionsSource == 'string' ) { //It is an Url to download options
            var cacheKey = 'options_' + params.field.id + '_' + optionsSource; //create a unique cache key
            var mustBuild = false;
            if ( funcParams._cacheCleared || ( ! cache[ cacheKey ] ) ) {
                //if user calls clearCache() or options are not found in the cache, download options
                mustBuild = true;
            } else {
                //found on cache..
                //if this method (getOptionsForField) is called to get option for a specific value (on funcParams.source == 'list')
                //and this value is not in cached options, we need to re-download options to get the unfound (probably new) option.
                if ( funcParams.value != undefined ) {
                    var optionForValue = findOptionByValue( cache[ cacheKey ], funcParams.value );
                    if ( optionForValue.displayText == undefined ) { //this value is not in cached options...
                        mustBuild = true;
                    }
                }
            }
            
            if ( mustBuild ){
                optionsList = buildOptionsFromArrayOrObject(
                    downloadOptions( 
                        params.field.id, 
                        optionsSource, 
                        params.options ),
                    params.field );
                cache[ cacheKey ] = optionsList;
                sortFieldOptions( cache[ cacheKey ], params.field.optionsSorting );
                
            } else {
                optionsList = cache[ cacheKey ];
            }
            
        } else {
            optionsList = buildOptionsFromArrayOrObject( optionsSource, params.field );
        }

        return optionsList;
    };
    
    var buildOptionsFromArrayOrObject = function( optionsSource, field ){
        
        var optionsList = undefined;
        
        if ( $.isArray( optionsSource ) ) { //It is an array of options
            optionsList = buildOptionsFromArray( optionsSource );
            sortFieldOptions( optionsList, field.optionsSorting );
            
        } else { //It is an object that it's properties are options
            optionsList = buildOptionsArrayFromObject( optionsSource );
            sortFieldOptions( optionsList, field.optionsSorting );
        }
        
        return optionsList;
    };
    
    /* Creates array of options from giving options array.
     ************************************************************************/
    var buildOptionsFromArray = function ( optionsArray ) {
        var list = [];

        for ( var i = 0; i < optionsArray.length; i++ ) {
            if ( $.isPlainObject( optionsArray[ i ] ) ) {
                list.push( optionsArray[ i ] );
            } else { //assumed as primitive type (int, string...)
                list.push({
                    value: optionsArray[ i ],
                    displayText: optionsArray[ i ]
                });
            }
        }

        return list;
    };
    
    /* Download options for a field from server.
    *************************************************************************/
    var downloadOptions = function ( fieldId, url, options ) {
        var result = [];

        var thisOptions = {
            url    : url,
            async  : false,
            success: function ( data ) {
                data = options.ajax.ajaxPostFilter( data );
                if ( data.result != 'OK' ) {
                    throw 'Error downloading options:' + data.message;
                }

                result = data.options;
            },
            error  : function ( data ) {
                data = options.ajax.ajaxPostFilter( data );
                throw self.options.messages.cannotLoadOptionsFor + fieldId;
            }
        };
        
        //options.ajax(
        options.ajax.ajaxFunction(
            $.extend( {}, options.ajax.defaultFormAjaxOptions, thisOptions ) );

        return result;
    };
    
    /* Sorts given options according to sorting parameter.
    *  sorting can be: 'value', 'value-desc', 'text' or 'text-desc'.
    *************************************************************************/
    var sortFieldOptions = function ( options, sorting ) {

        if ( ( ! options ) || ( ! options.length ) || ( ! sorting ) ) {
            return;
        }

        //Determine using value of text
        var dataSelector = undefined;
        if ( sorting.indexOf( 'value' ) == 0) {
            dataSelector = function ( option ) {
                return option.value;
            };
        } else { //assume as text
            dataSelector = function ( option ) {
                return option.displayText;
            };
        }

        var compareFunc = undefined;
        if ( $.type( dataSelector( options[ 0 ] ) ) == 'string' ) {
            compareFunc = function ( option1, option2 ) {
                return dataSelector( option1 ).localeCompare( dataSelector( option2 ) );
            };
        } else { //asuume as numeric
            compareFunc = function ( option1, option2 ) {
                return dataSelector( option1 ) - dataSelector( option2 );
            };
        }

        if ( sorting.indexOf( 'desc' ) > 0 ) {
            options.sort( function ( a, b ) {
                return compareFunc( b, a );
            });
        } else { //assume as asc
            options.sort( function ( a, b ) {
                return compareFunc( a, b );
            });
        }
    };
    
    /* Finds an option object by given value.
    *************************************************************************/
    var findOptionByValue = function (options, value) {
        return findItemByProperty( options, 'value', value );
    };
    
    /* Finds an option object by given value.
    *************************************************************************/
    var findItemByProperty = function ( items, key, value ) {
        for ( var i = 0; i < items.length; i++ ) {
            if ( items[ i ][ key ] == value ) {
                return items[ i ];
            }
        }

        return {}; //no item found
    };
    
    /* Creates an array of options from given object.
    *************************************************************************/
    var buildOptionsArrayFromObject = function ( options ) {
        var list = [];

        $.each( options, function ( propName, propValue ) {
            list.push({
                value: propName,
                displayText: propValue
            });
        });

        return list;
    };
    
    /* Creates and returns an object that's properties are depended values of a record.
    *************************************************************************/
    var createDependedValuesUsingRecord = function ( record, field ) {
        
        var dependsOn = field.dependsOn;
        if ( ! dependsOn ) {
            return {};
        }

        var dependedValues = {};
        for ( var i = 0; i < dependsOn.length; i++ ) {
            var fieldId = dependsOn[ i ];
            dependedValues[ fieldId ] = record[ fieldId ];
        }

        return dependedValues;
    };
    /*
    var createDependedValuesUsingRecord = function ( params ) {

        var dependsOn = params.field.dependsOn;
        if ( ! dependsOn ) {
            return {};
        }

        var record = params.record;

        var dependedValues = {};
        for ( var i = 0; i < dependsOn.length; i++ ) {
            var fieldId = dependsOn[ i ];
            dependedValues[ fieldId ] = record[ fieldId ];
        }

        return dependedValues;
    };*/
    
    var createDependedValuesUsingForm = function ( field, options, $selection ) {
        
        var dependedValues = {};
        
        for ( var i = 0; i < field.dependsOn.length; i++ ) {
            var dependedFieldId = field.dependsOn[ i ];
            var dependedField = options.fields[ dependedFieldId ];
            dependedValues[ dependedFieldId ] = $selection.find( "[name='" + dependedField.id + "']").val();
        }
        
        return dependedValues;
    };
    
    var afterProcessTemplateForFieldInCreateOrUpdate = function( params, $selection ){
        
        if ( ! params.field.dependsOn ){
            return;
        }
        
        var $thisDropdown = $selection.find( "[name='" + params.field.id + "']");
        //alert( '$thisDropdown.id: ' + $thisDropdown.attr( 'id' ));

        // Build dictionary
        var dictionary = params.dictionary;
        dictionary.field = params.field;
        dictionary.type = params.field.type;
        dictionary.value = params.value;
        
        //for each dependency
        $.each( params.field.dependsOn, function ( index, dependsOn ) {
            
            var dependsOnField = params.options.fields[ dependsOn ];
            
            //find the depended combobox
            var $dependsOnDropdown = $selection.find( "[name='" + dependsOnField.id + "']");
            
            //when depended combobox changes
            $dependsOnDropdown.change(function () {
                //alert( $( this ).val() );
                
                //Refresh options
                params.dependedValues = createDependedValuesUsingForm( params.field, params.options, $selection ) ;
                dictionary.optionsListFromForm = buildOptions( params );
                dictionary.record = params.record;
                
                // Refresh template
                zpt.run({
                    root: $thisDropdown[ 0 ],
                    dictionary: dictionary
                });

                //Thigger change event to refresh multi cascade dropdowns.
                $thisDropdown.change();
            });
        });
    };
    
    var afterProcessTemplateForField = function( params, $selection ){
        switch( params.source ) {
        case 'create':
        case 'update':
                afterProcessTemplateForFieldInCreateOrUpdate( params, $selection );
            break;
        case 'delete':
            // Nothing to do
            break; 
        default:
            throw "Unknown source in OptionListProviderManager: " + params.source;
        }
    };
    
    var getValueFromForm = function( field, options, $selection ){

        switch( field.type ) {
            case 'radio':
                return $selection.find( "input[name='" + field.id + "']:checked").val();
                //return $( 'input[name=' + field.id + ']:checked').val();
            case 'select':
            case 'optgroup':
            case 'datalist':
                return $selection.find( "input[name='" + field.id + "']").val();
                //return $( 'input[name=' + field.id + ']').val();
        }

        throw "Unknown field type in optionListProviderManager: " + field.type;
    };
    
    var setValueToForm = function( field, value, $this ){
        
        switch( field.type ) {
        case 'radio':
            $this.prop( 'checked', value? true: false );
            return;
        case 'select':
        case 'optgroup':
        case 'datalist':
            $this.val( value );
            //$this.blur();
            $this.change(); 
            return;
        }
        
        throw "Unknown field type in optionListProviderManager: " + field.type;
    };

    var getValueFromRecord = function( field, record, params ){

        switch( params.source ) {
            case 'create':
            case 'update':
                return record[ field.id ];
            case 'delete':
                var optionsList = getOptionsFromRecord( record, field, params.options );
                var tempValue = record[ field.id ];
                try {
                    var map = getDisplayTextMapFromArrayOptions( optionsList, field );
                    var inMapValue = map[ tempValue ];
                    return inMapValue? inMapValue: tempValue;
                } catch ( e ){
                    return tempValue;
                }
            default:
                throw "Unknown source in OptionListProviderManager: " + params.source;
        }
    };
    var getDisplayTextMapFromArrayOptions = function( optionsArray, field ){
        
        var map = {};
        
        for ( var i = 0; i < optionsArray.length; i++ ) {
            var option = optionsArray[ i ];
            map[ option.value ] = field.translateOptions? context.translate( option.displayText ): option.displayText;
        }
        
        return map;
    };
    
    var getTemplate = function( field ){
        return field.type + '@templates/fields/basic.html'
    };
    
    var getPostTemplate = function( field ){

        switch( field.type ) {
            case 'radio':
            case 'select':
            case 'optgroup':
                return;
            case 'datalist':
                return 'datalist-definition@templates/fields/basic.html';
        }

        throw "Unknown field type in optionListProviderManager: " + field.type;
    };
    /*
    var getLabelFor = function( field ){
        return field.type == 'radio'? undefined: field.elementId;
    };*/
    
    var mustHideLabel = function( field ){
        
        switch( field.type ) {
            case 'radio':
                return true;
            case 'select':
            case 'optgroup':
            case 'datalist':
                return false;
        }

        throw "Unknown field type in optionListProviderManager: " + field.type;
    };
    
    return {
        //beforeProcessTemplateForField: beforeProcessTemplateForField,
        afterProcessTemplateForField: afterProcessTemplateForField,
        getValueFromForm: getValueFromForm,
        setValueToForm: setValueToForm,
        getValueFromRecord: getValueFromRecord,
        getTemplate: getTemplate,
        //getLabelFor: getLabelFor,
        getOptionsFromRecord: getOptionsFromRecord,
        getPostTemplate: getPostTemplate,
        mustHideLabel: mustHideLabel
    };
}();

// TODO Implement support of optgroup
OptionListProviderManager.types = [ 'datalist', 'select', 'optgroup', 'radio' ];

module.exports = OptionListProviderManager;