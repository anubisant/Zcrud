"use strict";

var $ = require( 'jquery' );
var log4javascript = require( 'log4javascript' );

module.exports = {

    validation: {
        modules: '',
        rules: {},
        configuration: {
            errorMessageClass: 'form-error-inline-absolute', // form-error-fixed, form-error-inline-static and form-error-inline-absolute already exist
            borderColorOnError: ''
        }
    },
    dictionary: {},

    saveUserPreferences: true,
    body: document.body,
    entityId: 'entity',

    fields: {},
    fieldsConfig: {
        managers: [
            require( './fields/datetimeFieldManager.js' ),
            require( './fields/optionListProviderManager.js' ),
            require( './fields/checkboxFieldManager.js' ),
            require( './fields/subformManager.js' )
        ],
        defaultFieldOptions: {
            datetime: {
                inline: false,
                minYear: 1950,
                maxYear: 2050,
                maxHour: 23,
                minutesStep: 5,
                timerDelay: 100
            },
            date: {
                inline: false,
                minYear: 1950,
                maxYear: 2050
            },
            time: {
                inline: false,
                maxHour: 99,
                minutesStep: 5,
                timerDelay: 100
            }
        },
        getDefaultFieldTemplate: function( field ){
            return field.type + '@templates/fields/basic.html';
        }
    },

    containers: {
        types: {
            'fieldSet': {
                template: 'fieldSet@templates/containers/basic.html'
            },
            'div': {
                template: 'div@templates/containers/basic.html'
            }
        }
    },
    
    events: {
        formClosed: function ( data, event ) {},
        formCreated: function ( data ) {},
        formSubmitting: function ( data, event ) {},
        recordAdded: function ( data, event ) {},
        recordDeleted: function ( data, event ) {},
        recordUpdated: function ( data, event ) {},
        selectionChanged: function ( data ) {}
    },

    pageConf: {
        defaultPageConf: {
            modifiedFieldsClass: 'zcrud-modified-field',
            modifiedRowsClass: 'zcrud-modified-row',
            hideTr: function( $tr ){
                $tr.fadeOut();
            },
            showTr: function( $tr ){
                $tr.fadeIn();
            },
            buttons: {
                toolbar: {
                    undo: true,
                    redo: true,
                    cancel: true
                },
                byRow: {
                    openEditRegisterForm: true,
                    openDeleteRegisterForm: true,
                    deleteRegisterRow: true,
                }
            }
        },
        pages: {
            list: {
                template: "listDefaultTemplate@templates/lists.html",
                components: {
                    paging: {
                        isOn: true,
                        defaultPageSize: 10,
                        pageSizes: [10, 25, 50, 100, 250, 500],
                        pageSizeChangeArea: true,
                        gotoPageFieldType: 'combobox', // possible values: 'textbox', 'combobox', 'none'
                        gotoPageFieldAttributes: {},
                        maxNumberOfAllShownPages: 5,
                        block1NumberOfPages: 1,
                        block2NumberOfPages: 5,
                        block3NumberOfPages: 1
                    },
                    sorting: {
                        isOn: false,
                        loadFromLocalStorage: true,
                        default: {
                            fieldId: undefined,
                            type: undefined
                        },
                        allowUser: false
                    },
                    filtering: {
                        isOn: false
                    },
                    selecting: {
                        isOn: false,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // possible values: 'checkbox' and 'onRowClick'
                    },
                    editing: {
                        isOn: false,
                        modifiedFieldsClass: 'zcrud-modified-field',
                        modifiedRowsClass: 'zcrud-modified-row',
                        hideTr: function( $tr ){
                            $tr.fadeOut();
                        },
                        showTr: function( $tr ){
                            $tr.fadeIn();
                        }
                    }
                },
                buttons: {
                    toolbar: {
                        newRegisterRow: undefined,
                        openNewRegisterForm: undefined,
                        undo: undefined,
                        redo: undefined,
                        save: undefined
                    },
                    byRow: {
                        openEditRegisterForm: undefined,
                        openDeleteRegisterForm: undefined,
                        deleteRegisterRow: undefined,
                    }
                }
            }, 
            create: {
                template: "formDefaultTemplate@templates/forms.html"
            }, 
            update: {
                template: "formDefaultTemplate@templates/forms.html"
            }, 
            delete: {
                template: "deleteDefaultTemplate@templates/forms.html"
            }
        }
    },

    templates: {
        declaredRemotePageUrls: [],
        busyTemplate: "busyDefaultTemplate@templates/misc.html"
    },

    ajax: {
        ajaxFunction: $.ajax,
        defaultFormAjaxOptions: {
            dataType   : 'json',
            contentType: 'application/json; charset=UTF-8',
            type       : 'POST'
        },
        ajaxPreFilter: function( data ){
            return data;
        },
        ajaxPostFilter : function( data ){
            return data;
        }
    },

    i18n: {
        language: 'en',
        filesPath: 'i18n',
        i18nArrayVarName: 'i18nArray',
        files: { 
            en: [ 'en-common.json' ],
            es: [ 'es-common.json' ] 
        }
    },

    logging: {
        isOn: false,
        level: log4javascript.Level.ERROR
    },

    jsonBuilder: require( './jsonBuilders/onlyChangesJSONBuilder.js' ),
    
    fatalErrorFunction: function( message ){
        alert( message );
    }
};