import { compile, renderWidget } from './helpers';

beforeEach( () => {
    window.CustomPanel = compile`
        <h1>{{ title }}</h1>
        <div>
            {{ content }}
        </div>
    `;
} );

afterEach( () => {
    delete window.CustomPanel;
} );

it( 'should properly work with attributes', async() => {
    expect.assertions( 2 );
    const { widget, html } = await renderWidget(
        compile`
            <div>
                <CustomPanel title="string" content="text"/>
                <CustomPanel title="{{ value }}" content="{{ text }}"/>
            </div>
        `,
        {
            value: 'title',
            text: 'content'
        }
    );
    expect( html ).toBe(
        // eslint-disable-next-line max-len
        '<div><h1>string</h1><div>text</div><!--CustomPanel--><h1>title</h1><div>content</div><!--CustomPanel--></div>'
    );
    widget.update( { value: 'updated' } );
    expect( widget.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<div><h1>string</h1><div>text</div><!--CustomPanel--><h1>updated</h1><div>content</div><!--CustomPanel--></div>'
    );
} );

it( 'should render inline', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
            <div>
                <custom-inline>
                    <p>inline</p>
                </custom-inline>
                <custom-inline/>
            </div>
        `
    );
    expect( html ).toBe(
        '<div><p>inline</p><!--custom-inline--><p>inline</p><!--custom-inline--></div>'
    );
} );
