describe( 'SVG tags', function() {
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

    it( 'should properly render', function() {
        const { view, rendered } = render( () => new SvgIcon( '#root', 'svg-icon' ) );
        expect( view ).toBe(
            '<svg width="120" height="30" viewBox="0 0 120 30" fill="red"><circle cx="15" cy="15" r="15"></circle><circle cx="60" cy="15" r="9" fill-opacity=".3"></circle><circle cx="105" cy="15" r="15"></circle></svg>'
        );
        expect( rendered ).toEqual( [
            'svg-icon'
        ] )
    } );
} );