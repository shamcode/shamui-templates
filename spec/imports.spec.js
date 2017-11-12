describe( 'Import', function() {
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

    it( 'should require and mount template', function() {
        const { view, rendered } = render( () => new imports( '#root', 'imports' ) );
        expect( rendered ).toEqual( [
            'imports'
        ] );
        view.update( {
            text: 'upper'
        } );
        expect( view ).toBe( '<section>UPPER</section>' );
        expect( rendered ).toEqual( [
            'imports'
        ] );
    } );
} );