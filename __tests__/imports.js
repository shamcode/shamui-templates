import upperCase from 'upper-case';
import { compile, renderComponent } from './helpers';

beforeEach( () => {
    window.require = function( module ) {
        return 'upper-case' === module ? upperCase : null;
    };
} );

afterEach( () => {
    delete window.require;
} );

it( 'should require and mount template', async() => {
    expect.assertions( 1 );
    const { html } = await renderComponent(
        compile`
            {% import upperCase from 'upper-case' %}
            <section>
                {{ upperCase(text) | upperCase }}
            </section>
        `,
        {
            text: 'upper'
        }
    );
    expect( html ).toBe( '<section>UPPER</section>' );
} );
