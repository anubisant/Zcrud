/* 
    Class allJSONBuilder
*/
var defaultJSONBuilder = require( './defaultJSONBuilder.js' );

module.exports = (function() {
    "use strict";
    
    var sendOnlyModified = false;
        
    var buildJSONForRemoving = function( recordsToRemove ){
        return defaultJSONBuilder.buildJSONForRemoving( recordsToRemove );
    };

    var buildJSONForAll = function( keyField, records, fields, forcedActionsObject, history ){
        return defaultJSONBuilder.buildJSONForAll( sendOnlyModified, keyField, records, fields, forcedActionsObject, history );
    };
    
    var buildJSONForAddRecordMethod = function( record ){
        return defaultJSONBuilder.buildJSONForAddRecordMethod( record );
    };
    
    var buildJSONForUpdateRecordMethod = function( keyField, currentRecord, editedRecord, fieldsMap, fields, history ){
        return defaultJSONBuilder.buildJSONForUpdateRecordMethod( sendOnlyModified, keyField, currentRecord, editedRecord, fieldsMap, fields, history );
    };
    
    var getRecordFromJSON = function( jsonObject, formType, record, history ){
        return defaultJSONBuilder.getRecordFromJSON( jsonObject, formType, record, history );
    };
    
    var self = {
        buildJSONForAll: buildJSONForAll,
        buildJSONForRemoving: buildJSONForRemoving,
        buildJSONForAddRecordMethod: buildJSONForAddRecordMethod,
        buildJSONForUpdateRecordMethod: buildJSONForUpdateRecordMethod,
        getRecordFromJSON: getRecordFromJSON
    };
    
    return self;
})();

