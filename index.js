"use strict";

var journal = require( './build/Release/journal_send.node' );

function obj2iovec( iovec, obj, prefix ) {

	if( prefix === undefined ) prefix = '';

	// Go through all fields
	for( var o in obj ) {
		var name = o.toUpperCase();
		if( typeof obj[o] == 'object' ) {
			obj2iovec( iovec, obj[o], prefix + name + "_" );
		} else if( obj[o] != undefined && (prefix.length > 0 || (name != 'PRIORITY' && name != 'MESSAGE')) ) {
			iovec.push( prefix + name + '=' + obj[o].toString() );
		}
	}

}

function log( priority, message, fields ) {

	// If we haven't got a message, throw an error
	if( message === undefined ) {
		throw new Error( "Please specify a message" );
	}

	// Make sure fields is an object
	if( typeof fields != 'object' ) {
		fields = {};
	}

	// If the message is an instnce of Error, extract its message
	if( message instanceof Error ) {
		fields.STACK_TRACE = message.stack;
		message = message.message;
	} else if( typeof message != 'string' ) {
		message = message.toString();
	}

	var iovec = [];

	// Add default fields
	iovec.push( "MESSAGE=" + message );

	// Add additional fields
	obj2iovec( iovec, fields );

	// Send it to out beloved journald
	journal.send.apply( null, [ parseInt( priority ) ].concat( iovec ) );

}


module.exports = {};

// Syslog log levels
var levels = [
	'emerg',
	'alert',
	'crit',
	'err',
	'warning',
	'notice',
	'info',
	'debug'
];

// Export a function for every log level
for( var l in levels ) { ( function( prio, name ) {

	module.exports[ name ] = function( message, fields ) {
		log( prio, message, fields );
	};

} )( l, levels[ l ] ); }
