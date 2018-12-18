import { DI } from 'sham-ui';
import { compile, renderWidget } from './helpers';

beforeEach( () => {
    window.Custom = compile`
        <div id="custom" :ref={{name}}>{{name}}</div>
    `;
    window.Ref = class {
        constructor( widget ) {
            this.widget = widget;
            this.node = null;
            this.name = null;
        }

        bind( node ) {
            this.node = node;
        }

        unbind() {
            this.node = null;
            if ( this.name ) {
                delete this.widget[ this.name ];
            }
            this.name = null;
        }

        update( name ) {
            this.name = name;
            this.widget[ name ] = this.node;
        }
    };
} );

afterEach( () => {
    delete window.Custom;
    delete window.Ref;
} );


it( 'should be trimmed from html', async() =>{
    expect.assertions( 1 );

    function directiveMock() {
        return function() {
            this.bind = function() {};
            this.update = function() {};
            this.unbind = function() {};
        };
    }

    const directives = {
        fade: directiveMock(),
        show: directiveMock(),
        content: directiveMock()
    };

    const { html } = await renderWidget(
        compile`
            <div :fade/>
            <div :show={{ visible }}/>
            <div :content="come {{ text }}"/>
        `,
        {
            directives
        }
    );
    expect( html ).toBe( '<div></div><div></div><div></div>' );
} );

it( 'methods bind, update, unbind should be called', async() => {
    expect.assertions( 4 );

    const directive = jest.fn();
    directive.prototype.bind = jest.fn();
    directive.prototype.update = jest.fn();
    directive.prototype.unbind = jest.fn();

    const directives = { directive };

    const { widget } = await renderWidget(
        compile`<div :directive={{ value }}/>`,
        {
            directives,
            value: true
        }
    );
    expect( directive ).toHaveBeenCalledWith( widget );
    expect( directive.prototype.bind ).toHaveBeenCalledWith( widget.nodes[ 0 ] );
    expect( directive.prototype.update ).toHaveBeenCalledWith( true );

    DI.resolve( 'sham-ui' ).render.unregister( widget.ID );

    expect( directive.prototype.unbind ).toHaveBeenCalledWith( widget.nodes[ 0 ] );
} );

it( 'ref directive', async() => {
    expect.assertions( 9 );

    const { widget } = await renderWidget(
        compile`
            <div>
                <div id="foo" :ref="foo">
                    {% if test %}
                        <div id="test-true" :ref={{ test + "Inner"}}></div>
                    {% else %}
                        <div id="test-false" :ref={{ test + "Inner"}}></div>
                    {% endif %}
                </div>            
            </div>
        `,
        {
            directives: {
                ref: window.Ref
            },
            test: true
        }
    );
    expect( widget.foo.id ).toBe( 'foo' );
    expect( widget.trueInner.id ).toBe( 'test-true' );
    expect( widget.falseInner ).toBe( undefined );

    widget.update( { test: false } );

    expect( widget.foo.id ).toBe( 'foo' );
    expect( widget.trueInner ).toBe( undefined );
    expect( widget.falseInner.id ).toBe( 'test-false' );

    DI.resolve( 'sham-ui' ).render.unregister( widget.ID );

    expect( widget.foo ).toBe( undefined );
    expect( widget.trueInner ).toBe( undefined );
    expect( widget.falseInner ).toBe( undefined );
} );

it( 'ref directive with custom tag', async() => {
    expect.assertions( 5 );

    const { widget, html } = await renderWidget(
        compile`
            <div>
                <div id="foo" :ref="foo">
                    {% if test %}
                        <Custom name="foo"/>
                    {% else %}
                        <Custom name="bar"/>
                    {% endif %}
                </div>            
            </div>
        `,
        {
            directives: {
                ref: window.Ref
            },
            test: true
        }
    );
    expect( html ).toBe(
        '<div><div id="foo"><div id="custom">foo</div><!--Custom--></div></div>'
    );
    expect( widget.foo.id ).toBe( 'foo' );
    expect( widget.bar ).toBe( undefined );

    widget.update( { test: false } );

    expect( widget.foo.id ).toBe( 'foo' );
    expect( widget.bar ).toBe( undefined );
} );

