import { compile, renderComponent } from './helpers';

it( 'should properly render', async() => {
    expect.assertions( 1 );
    const { html } = await renderComponent(
        compile`
            <svg width="120" height="30" viewBox="0 0 120 30" fill="red">
                <circle cx="15" cy="15" r="15"/>
                <circle cx="60" cy="15" r="9" fill-opacity=".3"/>
                <circle cx="105" cy="15" r="15"/>
            </svg>
        `
    );
    expect( html ).toBe(
        // eslint-disable-next-line max-len
        '<svg width="120" height="30" viewBox="0 0 120 30" fill="red"><circle cx="15" cy="15" r="15"></circle><circle cx="60" cy="15" r="9" fill-opacity=".3"></circle><circle cx="105" cy="15" r="15"></circle></svg>'
    );
} );
