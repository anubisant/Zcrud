"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var testUtils = require( './testUtils' );
var context = require( '../../../js/app/context.js' );
var log4javascript = require( 'log4javascript' );

var options = {
    
    entityId: 'department',
    
    pages: {
        list: {
            action: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
            fields: [ 'id', 'name' ],
            components: {
                sorting: {
                    isOn: false,
                    default: {
                        fieldId: 'name',
                        type: 'asc'
                    },
                    allowUser: false
                },
                editing: {
                    isOn: true,
                    batchUpdateAction: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department',
                    event: 'batch',    // possible values: 'fieldChange', 'rowChange', 'batch'
                    dataToSend: 'modified', // possible values: 'modified', 'all',
                    modifiedFieldsClass: 'zcrud-modified-field',
                    modifiedRowsClass: 'zcrud-modified-row'
                }
            }
        }, create: {
            fields: [
                {
                    "type": "fieldSubset"
                }
            ]
        }, update: {
            fields: [
                {
                    "type": "fieldSubset"
                }
            ]
        }, delete: {
            fields: [
                {
                    "type": "fieldSubset"
                }
            ]
        }
    },
    
    fields: {
        id: {
            key: true,
            //create: true,
            //edit: true,
            //delete: true,
            sorting: false
        },
        name: {
        },
        description: {
            //list: false,
            type: 'textarea',
            //template: "descriptionTextarea",
            formFieldAttributes: {
                rows: 6,
                cols: 80
            }
        },
        date: {
            //list: false,
            type: 'date',
            customOptions: {
                inline: false
            }
        },
        time: {
            //list: false,
            type: 'time'
        },
        datetime: {
            //list: false,
            type: 'datetime'
        },
        phoneType: {
            //list: true,
            type: 'radio',
            translateOptions: true,
            //options: 'http://localhost/CRUDManager.do?table=phoneTypes',
            options: function(){
                return [ 'homePhone_option', 'officePhone_option', 'cellPhone_option' ];
            }
            /*
            options: function(){
                return [ 'Home phone!', 'Office phone!', 'Cell phone!!!' ];
            }*/
            //options: [ 'Home phone', 'Office phone', 'Cell phone' ]
            /*
            options: [
                { value: '1', displayText: 'Home phone!' }, 
                { lue: '2', displayText: 'Office phone!' }, 
                { value: '3', displayText: 'Cell phone!' } ]*/
            //options: { '1': 'Home phone', '2': 'Office phone', '3': 'Cell phone' }
        },
        province: {
            //list: false,
            type: 'select',
            options: [ 'Cádiz', 'Málaga' ],
            defaultValue: 'Cádiz'
        },
        city: {
            //list: false,
            type: 'select',
            dependsOn: 'province',
            options: function( data ){
                if ( ! data.dependedValues.province ){
                    return [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ]
                };
                
                switch ( data.dependedValues.province ) {
                case 'Cádiz':
                    return [ 'Algeciras', 'Tarifa' ];
                    break;
                case 'Málaga':
                    return [ 'Estepona', 'Marbella' ];
                    break;
                default:
                    throw 'Unknown province: ' + data.dependedValues.province;
                }
            }
        },
        browser: {
            //list: false,
            type: 'datalist',
            options: [ 'Internet Explorer', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
        },
        important: {
            //list: false,
            type: 'checkbox'
        },
        number: {
            //list: false
        }
    },

    validation: {
        modules: 'security, date',
        rules: {
            'name': {
                validation: 'length',
                length: '3-12'
            },
            'number': {
                validation: 'number',
                allowing: 'float'
            }
        },
        configuration: {
            errorMessageClass: 'form-error-inline-absolute',
        }
    },
    
    ajax: {
        ajaxFunction: testUtils.ajax    
    },

    events: { },
    
    i18n: {
        language: 'es',
        files: { 
            en: [ 'en-common.json', 'en-services.json' ],
            es: [ 'es-common.json', 'es-services.json' ] 
        }
    },
    
    logging: {
        isOn: true,
        level: log4javascript.Level.DEBUG,
    }
};

$( '#departmentsContainer' ).zcrud( 
    'init',
    options,
    function( options ){
        $( '#departmentsContainer' ).zcrud( 'load' );
    }
);

