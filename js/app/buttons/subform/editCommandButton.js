/*
    EditCommandButton class
*/
"use strict";

var Button = require( '../button.js' );

var EditCommandButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( EditCommandButton );

EditCommandButton.prototype.id = 'subform_editCommand';

EditCommandButton.prototype.cssClass = 'zcrud-edit-command-button';

EditCommandButton.prototype.selector = '.' + EditCommandButton.prototype.cssClass;

EditCommandButton.prototype.bindableIn = {
    subformRow: true
};

EditCommandButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Edit record'
        },
        content: undefined
    };
};

EditCommandButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showNewFormUsingRecordFromServer( 'update', event );
};

module.exports = EditCommandButton;
