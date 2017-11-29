describe( 'Directive', function() {
    var DI;

    function render( callback ) {
        const rendered = [];

        let view;
        DI.bind( 'widget-binder', () => {
            view = callback();
        } );
        const UI = new window.shamUI.default();
        UI.render.on( 'RenderComplete', ( event, renderedWidgets ) => {
            rendered.push( ...renderedWidgets );
        } );
        UI.render.FORCE_ALL();
        return { view, rendered };
    }

    beforeEach( function() {
        jasmine.addMatchers( customMatchers );
        var root = document.getElementById( 'root' );
        if ( null === root ) {
            root = document.createElement( 'div' );
            root.id = 'root';
            document
                .querySelector( 'body' )
                .appendChild( root )
            ;
            root = null;
        } else {
            root.innerHTML = '';
        }
        DI = window.DI;
    } );

    it( 'should be trimmed from html', function() {
        function directiveMock() {
            return function() {
                this.bind = function( node ) {};
                this.update = function( node ) {};
                this.unbind = function( node ) {};
            };
        }

        const directives = {
            fade: directiveMock(),
            show: directiveMock(),
            content: directiveMock()
        };

        const { view, rendered } = render( () => new DirectiveExample( '#root', 'directive-example', { directives } ) );
        expect( view ).toBe( '<div></div><div></div><div></div>' );
        expect( rendered ).toEqual( [
            'directive-example'
        ] );
    } );

    it( 'methods bind, update, unbind should be called', function() {
        const directive = function() {};
        directive.prototype.bind = function( value ) {};
        directive.prototype.update = function( value ) {};
        directive.prototype.unbind = function( value ) {};

        spyOn( directive.prototype, 'bind' );
        spyOn( directive.prototype, 'update' );
        spyOn( directive.prototype, 'unbind' );

        const directives = { directive };
        const options = { directives, value: true };

        const { view, rendered } = render( () => new DirectiveOne( '#root', 'directive-one', options ) );
        expect( rendered ).toEqual( [
            'directive-one'
        ] );
        view.remove();

        expect( directive.prototype.bind ).toHaveBeenCalledWith( view.nodes[ 0 ] );
        expect( directive.prototype.update ).toHaveBeenCalledWith( true );
        expect( directive.prototype.unbind ).toHaveBeenCalledWith( view.nodes[ 0 ] );
    } );
} );