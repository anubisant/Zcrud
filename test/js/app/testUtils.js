/* 
    testUtils singleton class
*/
module.exports = (function() {
    "use strict";
    
    var services = {
        '1': { name: 'Service 1' },
        '2': { name: 'Service 2' },
        '3': { name: 'Service 3' },
        '4': { name: 'Service 4' },
        '5': { name: 'Service 5' }
    };
    
    var phoneTypes = [ 'Home phone', 'Office phone', 'Cell phone' ];
    
    
    var ajax = function( options ){
        
        // Get file, cmd and table
        var url = options.url;
        var data = options.data;
        var file = url.split( '?' )[ 0 ];
        var parameters = parseQueryString( url.split( '?' )[ 1 ] );
        var cmd = parameters.cmd;
        var table = parameters.table;
        
        // Run AJAX
        switch ( table ) {
            case "department":
                ajaxServices( options, cmd, file, data );
                break;
            case "phoneTypes":
                ajaxPhoneTypes( options );
                break;
            default:
                throw "Unknown table in ajax: " + table;
        }
    };
    
    var ajaxPhoneTypes = function( options ){
        options.success({
            result: 'OK',
            message: '',
            options: phoneTypes
        });
    };
    
    var ajaxServices = function( options, cmd, file, data ){
        
        // Run command
        var dataToSend = undefined;
        switch ( cmd ) {
            case "LIST":
                dataToSend = ajaxServicesList( file );
                break;
            case "CREATE":
                dataToSend = ajaxServicesCreate( file, data );
                break;
            case "UPDATE":
                dataToSend = ajaxServicesUpdate( file, data );
                break;
            case "DELETE":
                dataToSend = ajaxServicesDelete( file, data );
                break;
            default:
                throw "Unknown command in ajax: " + cmd;
        }

        options.success( dataToSend );
    };
    
    var ajaxServicesList = function( file ){
        
        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';
        dataToSend.records = [];
        
        // Add all records to data
        var input = services;
        for ( var id in input ) {
            var service = input[ id ];
            service.id = id;
            dataToSend.records.push( service );
        }
        
        return dataToSend;
    };
    
    var ajaxServicesCreate = function( file, data ){
        return ajaxServicesCreateAndUpdate( file, data );
    };
    
    var ajaxServicesUpdate = function( file, data ){
        return ajaxServicesCreateAndUpdate( file, data );
    };
    
    var ajaxServicesCreateAndUpdate = function( file, data ){
        
        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';
        dataToSend.records = [];
        
        // Add all services to the map of services and to the dataToSend
        for ( var c = 0; c < data.records.length; c++ ) {
            var service = data.records[ c ];
            services[ service.id ] = service;
            dataToSend.records.push( service );
        }
        
        return dataToSend;
    };
    
    var ajaxServicesDelete = function( file, data ){
        
        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';
        dataToSend.records = [];
        
        // Add all services to the map of services and to the dataToSend
        for ( var c = 0; c < data.keys.length; c++ ) {
            var key = data.keys[ c ];
            var service = services[ key ];
            delete services[ key ];
            dataToSend.records.push( service );
        }
        return dataToSend;
    };
    
    var parseQueryString = function( query ) {
        var vars = query.split( "&" );
        var query_string = {};
        for ( var i = 0; i < vars.length; i++ ) {
            var pair = vars[ i ].split( "=" );
            // If first entry with this name
            if ( typeof query_string[ pair[ 0 ] ] === "undefined" ) {
                query_string[ pair[ 0 ] ] = decodeURIComponent( pair[ 1 ] );
                // If second entry with this name
            } else if ( typeof query_string[ pair[ 0 ] ] === "string" ) {
                var arr = [ query_string[pair[ 0 ]], decodeURIComponent( pair[ 1 ] )];
                query_string[ pair[ 0 ] ] = arr;
                // If third or later entry with this name
            } else {
                query_string[ pair[ 0 ] ].push( decodeURIComponent( pair[ 1 ] ) );
            }
        }
        return query_string;
    }
    
    return {
        ajax: ajax
    };
})();
