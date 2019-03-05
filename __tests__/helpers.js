import ShamUI, { DI } from 'sham-ui';
import { Compiler } from '../lib/index';
import { sourceNode } from '../lib/compiler/sourceNode';
import { transformSync } from '@babel/core';
import rootPackage from '../package.json';

const compiler = new Compiler( {
    asModule: false
} );

const compilerForSFW = new Compiler( {
    asSingleFileWidget: true,
    asModule: false
} );

function evalWidget( code ) {
    const fn = new Function( `var require=arguments[0];${code}return dummy;` );
    return fn( require );
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

export function compileAsSFW( strings ) {
    const node = sourceNode( '' );
    node.add(
        compilerForSFW.compile(
            'dummy.shw',
            strings.join( '\n' ).trim()
        )
    );
    const { code } = transformSync( node.toString(), rootPackage.babel );
    return evalWidget( code );
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
