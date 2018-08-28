/* 
    Button class
    
    run: a function with the code to run
*/
"use strict";

var $ = require( 'jquery' );

var Button = function( properties, parentToSet ) {
    
    if ( properties ){
        $.extend( true, this, properties );
    }
    this.parent = parentToSet;
};

Button.prototype.id = '"id" not set!';

Button.prototype.selector = '"selector" not set!';

Button.prototype.bindableIn = {};

Button.prototype.getTextsBundle = function(){
    throw '"getTextsBundle" method not implemented!';
};

Button.prototype.run = function(){
    throw '"Run" method not implemented!';
};

Button.doSuperClassOf = function( ChildButtonClass ){
    
    ChildButtonClass.prototype = new Button();
    ChildButtonClass.prototype.constructor = ChildButtonClass;
};

Button.prototype.isBindable = function( type ){
    return !! this.bindableIn[ type ];
};

Button.prototype.toString = function(){
    return this.id + " button";
};

module.exports = Button;
