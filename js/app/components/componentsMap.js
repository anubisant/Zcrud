/* 
    Class ComponentsMap 
*/
"use strict";

var context = require( '../context.js' );
var $ = require( 'jquery' );

var ComponentsMap = function ( optionsToApply, thisOptionsToApply, parentToApply, pageToApply ) {
    
    var options = optionsToApply;
    var thisOptions = thisOptionsToApply;
    var parent = parentToApply;
    var page = pageToApply;
    var components = {};
    
    // Initial configuration
    var configure = function(){
        registerAllComponents();
    };
    
    var registerAllComponents = function() {

        for ( var componentId in thisOptions ){
            var component = thisOptions[ componentId ];
            if ( component.isOn ){
                registerComponent( componentId, component );
            }
        }
    }

    var registerComponent = function( componentId, component ){
        
        // Get ConstructorClass
        var ConstructorClass = component.constructorClass;
        
        // Build component using ConstructorClass and add to components
        components[ componentId ] = new ConstructorClass( options, component, parent, page );
    };
    
    var getComponent = function( id ){
        return components[ id ];
    };
    
    var getSecureComponent = function( id ){
        
        var component = getComponent( id );
        if ( component ){
            return component;
        }
        
        throw 'Error in componentsMap trying to get component: ' + id;
    };

    // Reset all components
    var resetPage = function(){

        for ( var id in components ){
            var component = components[ id ];
            component.resetPage();
            /*
            if ( component && $.isFunction( component.resetPage ) ){
                component.resetPage();
            }*/
        }
    };
    
    var addToDataToSend = function( data ){

        for ( var id in components ){
            var component = components[ id ];
            component.addToDataToSend( data );
            /*
            if ( component && $.isFunction( component.addToDataToSend ) ){
                component.addToDataToSend( data );
            }*/
        }

        return data;
    };

    var dataFromServer = function( data ){

        for ( var id in components ){
            var component = components[ id ];
            component.dataFromServer( data );
            /*
            if ( component && $.isFunction( component.dataFromServer ) ){
                component.dataFromServer( data );
            }*/
        }
    };
    
    var bindEvents = function() {

        for ( var id in components ){
            var component = components[ id ];
            component.bindEvents();
            /*
            if ( component && $.isFunction( component.bindEvents ) ){
                component.bindEvents();
            }*/
        }
    };
    
    var bindEventsIn1Row = function( $row ) {

        for ( var id in components ){
            var component = components[ id ];
            component.bindEventsIn1Row( $row );
            /*
            if ( component && $.isFunction( component.bindEventsIn1Row ) ){
                component.bindEventsIn1Row( $row );
            }*/
        }
    };
    
    var self = {
        getComponent: getComponent,
        getSecureComponent: getSecureComponent,
        resetPage: resetPage,
        addToDataToSend: addToDataToSend,
        dataFromServer: dataFromServer,
        bindEvents: bindEvents,
        bindEventsIn1Row: bindEventsIn1Row
    };
    
    configure();
    
    return self;
};

module.exports = ComponentsMap;
