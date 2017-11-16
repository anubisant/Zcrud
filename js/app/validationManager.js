/* 
    validationsManager singleton class
*/
module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    require( 'jquery-form-validator' );
    var context = require( './context.js' );
    
    var errorClass = 'error';
    
    var validationOn = function( options ){
        return options.validation && options.validation.rules;
    };
    
    var initFormValidation = function( id, $forms, options ){

        // Init $forms if needed
        /*
        if ( ! $forms ){
            $forms = $( '#' + id );
        }*/

        // Return if there is nothing to do
        if ( ! validationOn( options ) ){
            return;
        }
        
        // Load the modules used in the form
        if ( options.validation.modules ){
            $.formUtils.loadModules( options.validation.modules );
        }

        // Add validation attributes
        addAttributes( $forms, options );
        
        // Set up form validation
        var defaultConfigurationOptions = {
            form: '#' + id,
            language: context.getFormValidationLanguage(),
            decimalSeparator: context.translate( 'decimalSeparator' )
            /*
            inlineErrorMessageCallback: function( $input, errorMessage, config ){
                if ( errorMessage ){
                    $forms.find( '.zcrud-save-command-button' ).prop( 'disabled', true );
                }
                return true;
            }*/
        };
        var configurationOptionsToApply = $.extend( {}, defaultConfigurationOptions, options.validation.configuration );
        $.validate( configurationOptionsToApply );
    };
    
    var addAttributes = function( $forms, options ){
        
        var fieldValidationOptions = buildFieldOptions();
        var validate = $.extend( true, {}, options.validation.rules, fieldValidationOptions );
        addGeneralAttributes( $forms, options, validate );
    };
    
    var addGeneralAttributes = function( $forms, options, validate ){

        $.each( validate || {}, function( elemRef, attr ) {
            var $1elem = undefined;
            var $elems = undefined;
            if ( elemRef[ 0 ] === '#' ) {
                $1elem = $( elemRef );
            } else if ( elemRef[ 0 ] === '.' ) {
                $elems = $forms.find( elemRef );
            } else {
                $elems = $forms.find( "[name='" + elemRef + "']" );
            }
            
            if ( $1elem ){
                addAttribute( $1elem, attr );
            } else {
                $elems.each( function() {
                    addAttribute( $( this ), attr );
                });
            }
        });
    };
    
    var addAttribute = function( $elem, attr ){
        
        $elem.attr( 'data-validation', attr.validation );
        //$elem.attr( 'data-validation-event', 'change' );
        
        $.each( attr, function( name, val ) {
            if ( name !== 'validation' && val !== false ) {
                if ( val === true ) {
                    val = 'true';
                }
                if ( name[ 0 ] === '_' ) {
                    name = name.substring( 1 );
                    if( val === false ) {
                        $elem.removeAttr( name );
                    } else {
                        $elem.attr( name, val );
                    }
                } else {
                    $elem.valAttr( name, val );
                }
            }
        });

    };
    
    var formIsValid = function( options, dataToSend ){
        
        var eventResult = options.events.formSubmitting( options, dataToSend );
        
        if ( ! validationOn( options ) ){
            return false != eventResult;
        }
        
        return $( '.' + errorClass ).length === 0 && false != eventResult;
    };
    
    var buildFieldOptions = function( options ){
        return {};
    };
    
    return {
        initFormValidation: initFormValidation,
        formIsValid: formIsValid
    };
})();
