"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
//var Qunit = require( 'qunitjs' );
var testUtils = require( './testUtils' );

zcrud.run({
    body: document.body,
    target: $( '#departmentsContainer' ),
    title: 'Departments',
    entityId: 'department',
    actions: {
        listAction:   'http://localhost:8080/cerbero/CRUDManager.do?cmd=LIST&table=department',
        createAction: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=CREATE&table=department',
        updateAction: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=UPDATE&table=department',
        deleteAction: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=DELETE&table=department'
    },
    fields: {
        id: {
            //title: 'Id',
            //description: 'The unique id of the department!',
            key: true,
            create: true,
            edit: true,
            delete: true
        },
        name: {
            //title: 'Name',
            //description: 'The name of the department!',
            width: '90%'
        },
        description: {
            //title: 'Description',
            //description: 'The description of the department!',
            list: false,
            type: 'textarea',
            //template: "descriptionTextarea",
            formFieldAttributes: {
                rows: 6,
                cols: 80
            }
        },
        date: {
            //title: 'Date',
            //description: 'The date of the department!',
            list: false,
            type: 'date',
            customOptions: {
                inline: true
            }
        },
        time: {
            //title: 'Time',
            //description: 'The time of the department!',
            list: false,
            type: 'time'
        },
        datetime: {
            //title: 'Datetime',
            //description: 'The datetime of the department!',
            list: false,
            type: 'datetime'
        },
        phoneType: {
            //title: 'Phone type',
            //description: 'The phone type of the department!',
            list: false,
            type: 'radio',
            options: 'http://localhost:8080/cerbero/CRUDManager.do?table=phoneTypes'
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
            //title: 'Province',
            //description: 'The province of the department!',
            list: false,
            type: 'select',
            options: [ 'Cádiz', 'Málaga' ],
            defaultValue: 'Cádiz'
        },
        city: {
            //title: 'City',
            //description: 'The city of the department!',
            list: false,
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
            //title: 'Browser',
            //description: 'The prefered browser of the department!',
            list: false,
            type: 'datalist',
            options: [ 'Internet Explorer', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
        },
        important: {
            //title: 'Important',
            //description: 'Is important???',
            list: false,
            type: 'checkbox'
        }
    },

    validation: {
        modules: 'security, date',
        rules: {
            '#zcrud-name': {
                validation: 'length',
                length : '3-12'
            }
        }
    },
    
    listTemplate: "'listDefaultTemplate@templates/lists.html'",
    updateTemplate: "'formDefaultTemplate@templates/forms.html'",
    //updateTemplate: "'formTemplate@templates/customForms.html'",
    createTemplate: "'formDefaultTemplate@templates/forms.html'",
    deleteTemplate: "'deleteDefaultTemplate@templates/forms.html'",
    
    ajax: testUtils.ajax,
    /*
    ajaxPreFilter : function( data ){
        return data;
    },
    ajaxPostFilter : function( data ){
        return {
            records: data.Records,
            result : data.Result,
            message: data.Message
        };
    }*/
    events: {
        /*
        formCreated: function ( options ) { 
            alert( 'Form created! ' + options.currentForm.type );
        }*/
        /*
        formSubmitting: function ( options, dataToSend ) { 
            alert( 'Form submit! ' + options.currentForm.type );
            return false;
        }*/
        recordDeleted: function ( event, options, key ) { 
            alert ( 'recordDeleted! '  + options.currentForm.type + ': ' + key );
        }
    }
});
