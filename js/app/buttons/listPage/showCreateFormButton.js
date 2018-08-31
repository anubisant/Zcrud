/*
    ShowCreateFormButton class
*/
"use strict";

var Button = require( '../button.js' );

var ShowCreateFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowCreateFormButton );

ShowCreateFormButton.prototype.id = 'list_showCreateForm';

ShowCreateFormButton.prototype.cssClass = 'zcrud-new-command-button';

//ShowCreateFormButton.prototype.selector = '.' + ShowCreateFormButton.prototype.cssClass;

ShowCreateFormButton.prototype.bindableIn = {
    listToolbar: true
};

ShowCreateFormButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: true,
            text: 'Add new record'
        },
        content: undefined
    };
};

ShowCreateFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showCreateForm( event );
};

module.exports = ShowCreateFormButton;
