/*
    AddNewRowButton class
*/
"use strict";

var Button = require( '../button.js' );

var AddNewRowButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( AddNewRowButton );

AddNewRowButton.prototype.id = 'list_addNewRow';

AddNewRowButton.prototype.selector = '.zcrud-new-row-command-button';

AddNewRowButton.prototype.bindableIn = {
    listToolbar: true
};

AddNewRowButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: true,
            text: 'Add new record'
        },
        content: {
            translate: false,
            text: ''
        }
    };
};

AddNewRowButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).addNewRow( event );
};

module.exports = AddNewRowButton;
