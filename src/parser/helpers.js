function SourceLocation( source, start, end ) {
    this.source = source;
    this.start = start;
    this.end = end;
}

function Position( line, column ) {
    this.line = line;
    this.column = column;
}

// eslint-disable-next-line no-unused-vars
function createSourceLocation( firstToken, lastToken ) {
    return new SourceLocation(

        // eslint-disable-next-line no-undef
        parser.source, // Some sort of magic. In this way we can pass filemane into jison generated parser.
        new Position( firstToken.first_line, firstToken.first_column ),
        new Position( lastToken.last_line, lastToken.last_column )
    );
}

// eslint-disable-next-line no-unused-vars
function parseRegularExpressionLiteral( literal ) {
    var last = literal.lastIndexOf( '/' );
    var body = literal.substring( 1, last );
    var flags = literal.substring( last + 1 );

    return new RegExp( body, flags );
}

// eslint-disable-next-line no-unused-vars
function parseNumericLiteral( literal ) {
    if ( literal.charAt( 0 ) === '0' ) {
        if ( literal.charAt( 1 ).toLowerCase() === 'x' ) {
            return parseInt( literal, 16 );
        } else {
            return parseInt( literal, 8 );
        }
    } else {
        return Number( literal );
    }
}

/* Begin Parser Customization Methods */
// eslint-disable-next-line no-undef
var originalParseMethod = parser.parse;

// eslint-disable-next-line no-undef
parser.parse = function( source, code ) {

    // eslint-disable-next-line no-undef
    parser.source = source;
    return originalParseMethod.call( this, code );
};

/* End Parser Customization Methods */
