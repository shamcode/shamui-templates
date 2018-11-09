import { compile, renderWidget } from './helpers';

it( 'dummy', async() => {
    expect.assertions( 3 );
    const { html, text, widget } = await renderWidget( compile`<div>test</div>` );
    expect( html ).toBe( '<div>test</div>' );
    expect( text ).toBe( 'test' );
    expect( widget.name ).toBe( 'dummy' );
} );
