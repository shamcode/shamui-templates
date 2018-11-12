import ShamUI, { DI } from 'sham-ui';
import { Compiler } from '../lib/index';
import { sourceNode } from '../lib/compiler/sourceNode';

const compiler = new Compiler( {
    asModule: false
} );

function evalWidget( code ) {
    const fn = new Function( `${code}return dummy;` );
    return fn();
}

export function compile( strings ) {
    const node = sourceNode( '' );
    node.add(
        compiler.compile(
            'dummy.sht',
            strings.join( '\n' ).trim()
        )
    );
    return evalWidget( node.toString() );
}

export function renderWidget( widgetConstructor, options = {} ) {
    return new Promise( resolve => {
        let widget;
        DI.bind( 'widget-binder', function() {
            widget = new widgetConstructor( {
                ID: 'dummy',
                containerSelector: 'body',
                ...options
            } );
        } );
        const UI = new ShamUI();
        UI.render.one( 'RenderComplete', () => {
            const body = document.querySelector( 'body' );
            resolve( {
                widget,
                html: body.innerHTML,
                text: body.textContent
            } );
        } );
        UI.render.ALL();
    } );
}
