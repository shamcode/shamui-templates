import ShamUI, { DI } from 'sham-ui';
import { Compiler } from '../lib/index';
import { sourceNode } from '../lib/compiler/sourceNode';
import { transformSync } from '@babel/core';
import rootPackage from '../package.json';

const compiler = new Compiler( {
    asModule: false
} );

const compilerForSFC = new Compiler( {
    asSingleFileComponent: true,
    asModule: false
} );

function evalComponent( code ) {
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
    return evalComponent( node.toString() );
}

export function compileAsSFC( strings ) {
    const node = sourceNode( '' );
    node.add(
        compilerForSFC.compile(
            'dummy.shw',
            strings.join( '\n' ).trim()
        )
    );
    const { code } = transformSync( node.toString(), rootPackage.babel );
    return evalComponent( code );
}

export function renderComponent( componentConstructor, options = {} ) {
    return new Promise( resolve => {
        let component;
        DI.bind( 'component-binder', function() {
            component = new componentConstructor( {
                ID: 'dummy',
                containerSelector: 'body',
                ...options
            } );
        } );
        const UI = new ShamUI();
        UI.render.one( 'RenderComplete', () => {
            const body = document.querySelector( 'body' );
            resolve( {
                component,
                html: body.innerHTML,
                text: body.textContent
            } );
        } );
        UI.render.ALL();
    } );
}
