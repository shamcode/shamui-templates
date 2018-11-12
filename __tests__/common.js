import { compile, renderWidget } from './helpers';

it( 'should render simple DOM', async() => {
    expect.assertions( 3 );
    const { html, text, widget } = await renderWidget( compile`<div>test</div>` );
    expect( html ).toBe( '<div>test</div>' );
    expect( text ).toBe( 'test' );
    expect( widget.name ).toBe( 'dummy' );
} );


it( 'should insert variable as text node', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`<p>{{ text }}</p>`,
        {
            text: 'To understand what recursion is, you must first understand recursion.'
        }
    );
    expect( html ).toBe(
        '<p>To understand what recursion is, you must first understand recursion.</p>'
    );
} );


it( 'should insert variable in attributes', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`<input type="text" value="{{ value }}">`,
        {
            value: 'Value'
        }
    );
    expect( widget.nodes[ 0 ].value ).toEqual( 'Value' );
    expect( html ).toBe( '<input type="text">' );
} );
