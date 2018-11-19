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

it( 'should optimize "if"/"for" tag, if it is only child', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
        <div>
            <p>
                {% if a %}a{% endif %}
            </p>

            <p>
                {% for b %}b{% endfor %}
            </p>
        </div>
        `,
        {
            a: true,
            b: [ 1 ]
        }
    );
    expect( html ).toBe( '<div><p>a</p><p>b</p></div>' );
} );

it( 'should place placeholders for multiply "if" tags', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
        <div>
            {% if a %}a{% endif %}
            {% if b %}b{% endif %}
        </div>
        `
    );
    expect( html ).toBe( '<div><!--if--><!--if--></div>' );
} );

it( 'should place placeholders for multiply "if" and "for" tags', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
        <div>
            {% if a %}a{% endif %}
            {% for b %}i{% endfor %}
        </div>
        `
    );
    expect( html ).toBe( '<div><!--if--><!--for--></div>' );
} );


it( 'should properly for with filters', async() => {
    expect.assertions( 1 );
    const filters = {
        append: function( value, text ) {
            return value + text;
        },
        upperCase: function( value ) {
            return value.toUpperCase();
        }
    };
    const { html } = await renderWidget(
        compile`<p>{{ text | append('case') | upperCase }}</p>`,
        { filters, text: 'upper_' }
    );
    expect( html ).toBe( '<p>UPPER_CASE</p>' );
} );


it( 'should work with expressions', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`
        <a title="{{ (a + b) * c / d }}">{{ more.amazing + features[0] + features[1] }}</a>
        `,
        {
            a: 1,
            b: 2,
            c: 100,
            d: 2,
            more: {
                amazing: 'a'
            },
            features: [ 'b', 'c' ]
        }
    );
    expect( html ).toBe( '<a title="150">abc</a>' );
    widget.update( { more: { amazing: 'Amazing!' } } );
    expect( widget.container.innerHTML ).toBe( '<a title="150">Amazing!bc</a>' );
} );
