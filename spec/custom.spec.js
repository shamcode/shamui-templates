describe( 'Custom tags', function() {
    var DI;

    function render( callback ) {
        const rendered = [];

        let view;
        DI.bind( 'widget-binder', () => {
            view = callback();
        } );
        const UI = new window.shamUI.default();
        UI.render.on( 'RenderComplete', ( event, renderedWidgets ) => {
            renderedWidgets.forEach( id => {
                const index = id.lastIndexOf( '~' );
                if ( -1 === index ) {
                    rendered.push( id );
                } else {
                    rendered.push( id.substring( 0, index ) );
                }
            } );
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

    it( 'should properly work with attributes', function() {
        const { view, rendered } = render( () => new CustomAttributes( '#root', 'custom-attributes', {
            value: 'title',
            text: 'content'
        } ) );
        expect( view ).toBe(
            '<div><h1>string</h1><div>text</div><!--CustomPanel--><h1>title</h1><div>content</div><!--CustomPanel--></div>'
        );
        expect( rendered ).toEqual( [
            'CustomPanel',
            'CustomPanel',
            'custom-attributes'
        ] );
        view.update( { value: 'updated' } );
        expect( view ).toBe(
            '<div><h1>string</h1><div>text</div><!--CustomPanel--><h1>updated</h1><div>content</div><!--CustomPanel--></div>'
        );
        expect( rendered ).toEqual( [
            'CustomPanel',
            'CustomPanel',
            'custom-attributes'
        ] );
    } );

    it( 'should render inline', function() {
        const { view, rendered } = render( () => new CustomInline( '#root', 'custom-inline' ) );
        expect( view )
            .toBe( '<div><p>inline</p><!--custom-inline--><p>inline</p><!--custom-inline--></div>'
        );
        expect( rendered ).toEqual( [
            'custom_inline',
            'custom_inline',
            'custom-inline'
        ] );
    } );

} );