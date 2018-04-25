/* 
    fieldListBuilder singleton class
*/
var $ = require( 'jquery' );
var normalizer = require( './normalizer.js' );
var fieldBuilder = require( './fields/fieldBuilder' );

module.exports = (function() {
    "use strict";
    
    var get = function( pageId, options ){
        
        var pageOptions = options.pages[ pageId ];
        if ( ! pageOptions ){
            throw 'Page id not found: ' + pageId;
        }
        
        if ( pageOptions.fieldsCache ){
            return pageOptions.fieldsCache;
        }
        
        var fieldsArray = build( pageOptions.fields, options );
        var fieldsMap = buildMapFromArray( fieldsArray, fieldBuilder.buildFields );
        
        var fieldsCache = {
            fieldsArray: fieldsArray,
            fieldsMap: fieldsMap
        };
        pageOptions.fieldsCache = fieldsCache;
        
        return fieldsCache;
    };
    
    var buildMapFromArray = function( fieldsArray, functionToApplyToField ){
        
        var result = {};
        
        for ( var c = 0; c < fieldsArray.length; ++c ){
            var field = fieldsArray[ c ];
            result[ field.id ] = field;
            
            if ( functionToApplyToField ){
                functionToApplyToField( field );
            }
        }
        
        return result;
    };
    
    var build = function( items, options ) {

        var result = [];
        
        for ( var c = 0; c < items.length; ++c ){
            
            var item = items[ c ];
            
            // Is string?
            if ( $.type( item ) === 'string' ){
                result.push( options.fields[ item ] );
                
            // Is fieldSubset?
            } else if ( item.type == 'fieldSubset' ){
                buildFieldsFromFieldSubset( item, options, result );
                
            // Must be a field instance
            } else {
                normalizer.normalizeFieldOptions( item.id, item, options );
                result.push( item );
            }
        }
        
        return result;
    };
    
    var buildFieldsFromFieldSubset = function( item, options, result ) {
        
        var start = item.start;
        var end = item.end;
        var except = item.except;
        var source = item.source; // 'default' or page id
        
        var allFields = buildFieldsFromSource( source, options );
        
        var started = ! start;
        var ended = false;
        
        for ( var c = 0; c < allFields.length; ++c ){
            
            var field = allFields[ c ];
            var id = field.id;
            
            if ( id === start ){
                started = true;
            }
            if ( id === end ){
                ended = true;
            }
            
            if ( started && ( except? -1 === except.indexOf( id ): true ) ){
                result.push( field );
            }
            
            if ( ended ){
                return;
            }
        }
    };
    
    var buildFieldsFromSource = function( source, options ){
        
        // Is default?
        if ( ! source || source === '' || source === 'default' ){
            var result = [];
            $.each( options.fields, function ( fieldId, field ) {
                result.push( field );
            });
            return result;
        }
        
        // Must be a page id
        try {
            return options.pages[ source ].fieldsCache.fieldsArray;
        } catch ( e ) {
            throw 'Not built fields from source ' + source;
        }
    };
    
    var self = {
        get: get,
        build: build,
        buildMapFromArray: buildMapFromArray
    };
    
    return self;
})();
