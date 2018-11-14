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


it( 'should properly work with text constants in text nodes', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`<p>foo {{ bar }} baz</p>`,
        {
            bar: 'bar'
        }
    );
    expect( html ).toBe( '<p>foo bar baz</p>' );
} );

it( 'should properly work with text constants in attributes', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`<div class="foo {{ bar }} baz"></div>`,
        {
            bar: 'bar'
        }
    );
    expect( html ).toBe( '<div class="foo bar baz"></div>' );
} );


it( 'should save value for variables in complex cases', async() => {
    expect.assertions( 2 );
    const { widget, html } = await renderWidget(
        compile`<div class="{{ foo }} {{ bar }}"></div>`,
        {
            foo: 'first',
            bar: 'second'
        }
    );
    expect( html ).toBe( '<div class="first second"></div>' );
    widget.update( {
        foo: 'updated'
    } );
    expect( widget.container.innerHTML ).toBe( '<div class="updated second"></div>' );
} );


it( 'should properly work with more then one node on topmost level', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
        <p>first</p>

        <p>second</p>
        `
    );
    expect( html ).toBe( '<p>first</p><p>second</p>' );
} );
