import { compile, renderWidget } from './helpers';

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
    expect.assertions( 3 );

    const directive = function() {};
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
    widget.remove();

    expect( directive.prototype.bind ).toHaveBeenCalledWith( widget.nodes[ 0 ] );
    expect( directive.prototype.update ).toHaveBeenCalledWith( true );
    expect( directive.prototype.unbind ).toHaveBeenCalledWith( widget.nodes[ 0 ] );
} );
