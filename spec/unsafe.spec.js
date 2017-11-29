describe( 'Unsafe', function() {
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

    it( 'should insert constants as HTML', function() {
        const { view, rendered } = render( () => new UnsafeWithConstant( '#root', 'unsafe-with-constant' ) );
        expect( view ).toBe( '<div><br></div>' );
        expect( rendered ).toEqual( [
            'unsafe-with-constant'
        ] )
    } );

    it( 'should insert variables as HTML', function() {
        const { view, rendered } = render( () => new UnsafeWithVariables( '#root', 'unsafe-with-variables' ) );
        expect( view ).toBe( '<div></div>' );
        expect( rendered ).toEqual( [
            'unsafe-with-variables'
        ] );

        view.update( { html: '<a href="javascript:XSS;">Link</a>' } );
        expect( view ).toBe( '<div><a href="javascript:XSS;">Link</a></div>' );
        expect( rendered ).toEqual( [
            'unsafe-with-variables'
        ] );
    } );

    it( 'should remove old DOM nodes and insert new', function() {
        const { view, rendered } = render( () => new UnsafeWithVariables( '#root', 'unsafe-with-variables', {
            html: '<div>foo</div><br>'
        } ) );
        expect( view ).toBe( '<div><div>foo</div><br></div>' );

        view.update( { html: '<input type="datetime"><hr><div>baz</div>' } );
        expect( view ).toBe( '<div><input type="datetime"><hr><div>baz</div></div>' );

        view.update( { html: '' } );
        expect( view ).toBe( '<div></div>' );

        view.update( { html: '<!-- comment -->' } );
        expect( view ).toBe( '<div><!-- comment --></div>' );
        expect( rendered ).toEqual( [
            'unsafe-with-variables'
        ] );
    } );

    it( 'should insert unsafe with placeholders', function() {
        const { view, rendered } = render( () => new UnsafeWithPlaceholder( '#root', 'unsafe-with-placeholder', {
            html: '<hr>'
        } ) );
        expect( view ).toBe( '<div><br><!--unsafe--><hr><!--unsafe--></div>' );

        view.update( { html: '<br><!-- comment --><link href="http://ShamUIView.js.org">' } );
        expect( view ).toBe(
            '<div><br><!--unsafe--><br><!-- comment --><link href="http://ShamUIView.js.org"><!--unsafe--></div>'
        );
        expect( rendered ).toEqual( [
            'unsafe-with-placeholder'
        ] );
    } );
} );