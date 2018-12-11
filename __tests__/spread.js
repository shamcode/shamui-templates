import { compile, renderWidget } from './helpers';

beforeEach( () => {
    window.SpreadCustom = compile`
        <i>{{ foo }}</i>
        <i>{{ boo }}</i>
        <i>{{ bar }}</i>
    `;
} );

afterEach( () => {
    delete window.SpreadCustom;
} );

it( 'should render arrays', async() => {
    expect.assertions( 3 );
    const { html, widget } = await renderWidget(
        compile`
            <ul>
                {% for key, value of list %}
                    <li>{{ key }}:{{ value }}</li>
                {% endfor %}
            </ul>
        `,
        {
            list: [ 1, 2, 3 ]
        }
    );
    expect( html ).toBe( '<ul><li>0:1</li><li>1:2</li><li>2:3</li></ul>' );

    widget.update( { list: [ 1, 3 ] } );
    expect( widget.container.innerHTML ).toBe( '<ul><li>0:1</li><li>1:3</li></ul>' );

    widget.update( { list: [ 'a', 'b', 'c', 'd' ] } );
    expect( widget.container.innerHTML ).toBe(
        '<ul><li>0:a</li><li>1:b</li><li>2:c</li><li>3:d</li></ul>'
    );
} );

it( 'should work for html elements', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
            <div {{...attr}}></div>
        `,
        {
            attr: {
                id: 'id',
                'data-attr': 'data',
                'class': 'foo'
            }
        }
    );
    expect( html ).toBe( '<div id="id" data-attr="data" class="foo"></div>' );
} );

it( 'should override default attributes', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`<div id="foo" {{...attr}}></div>`
    );
    expect( html ).toBe( '<div id="foo"></div>' );

    widget.update( {
        attr: {
            id: 'boo'
        }
    } );
    expect( widget.container.innerHTML ).toBe( '<div id="boo"></div>' );
} );

it( 'should override variables attributes', async() => {
    expect.assertions( 3 );
    const { html, widget } = await renderWidget(
        compile`
            <div id="{{ id }}" {{...attr}}></div>
        `,
        {
            id: 'foo'
        }
    );
    expect( html ).toBe( '<div id="foo"></div>' );

    widget.update( {
        attr: {
            id: 'boo'
        }
    } );
    expect( widget.container.innerHTML ).toBe( '<div id="boo"></div>' );

    widget.update( { id: 'bar', attr: {} } );
    expect( widget.container.innerHTML ).toBe( '<div id="bar"></div>' );
} );

it( 'should work for custom tags', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                <SpreadCustom {{...attr}}/>
            </div>
        `,
        {
            attr: {
                foo: 'foo',
                boo: 'boo',
                bar: 'bar'
            }
        }
    );
    expect( html ).toBe( '<div><i>foo</i><i>boo</i><i>bar</i></div>' );

    widget.update( {
        attr: {
            boo: 'Boo-Ya'
        }
    } );
    expect( widget.container.innerHTML ).toBe( '<div><i>foo</i><i>Boo-Ya</i><i>bar</i></div>' );
} );

it( 'should work for custom tags with constant attributes values', async() => {
    expect.assertions( 3 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                <SpreadCustom {{...attr}} foo="foo"/>
            </div>
        `
    );
    expect( html ).toBe( '<div><i>foo</i><i></i><i></i></div>' );

    widget.update( {
        attr: {
            boo: 'boo',
            bar: 'bar'
        }
    } );
    expect( widget.container.innerHTML ).toBe( '<div><i>foo</i><i>boo</i><i>bar</i></div>' );

    widget.update( {
        attr: {
            foo: 'over foo'
        }
    } );
    expect( widget.container.innerHTML ).toBe( '<div><i>over foo</i><i>boo</i><i>bar</i></div>' );
} );

it( 'should work for custom tags with attributes with values', async() => {
    expect.assertions( 4 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                <SpreadCustom {{...attr}} foo="{{ foo }}"/>
            </div>
        `
    );
    expect( html ).toBe( '<div></div>' );

    widget.update( {
        attr: {
            boo: 'boo',
            bar: 'bar'
        }
    } );
    expect( widget.container.innerHTML ).toBe( '<div><i></i><i>boo</i><i>bar</i></div>' );

    widget.update( {
        foo: 'foo'
    } );
    expect( widget.container.innerHTML ).toBe( '<div><i>foo</i><i>boo</i><i>bar</i></div>' );

    widget.update( {
        attr: {
            foo: 'over foo'
        },
        foo: 'for'
    } );
    expect( widget.container.innerHTML ).toBe( '<div><i>for</i><i>boo</i><i>bar</i></div>' );
} );
