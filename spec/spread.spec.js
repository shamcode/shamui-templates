describe( 'Spread attributes', function() {
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

    it( 'should work for custom tags', function() {
        const { view, rendered } = render( () => new SpreadCustomAttributes( '#root', 'spread-custom-attributes', {
            attr: {
                foo: 'foo',
                boo: 'boo',
                bar: 'bar'
            }
        } ) );
        expect( rendered ).toEqual( [
            'SpreadCustom',
            'spread-custom-attributes'
        ] );
        expect( view ).toBe( '<div><i>foo</i><i>boo</i><i>bar</i></div>' );
        expect( rendered ).toEqual( [
            'SpreadCustom',
            'spread-custom-attributes'
        ] );

        view.update( {
            attr: {
                boo: 'Boo-Ya'
            }
        } );
        expect( view ).toBe( '<div><i>foo</i><i>Boo-Ya</i><i>bar</i></div>' );
        expect( rendered ).toEqual( [
            'SpreadCustom',
            'spread-custom-attributes'
        ] );
    } );

    it( 'should work for custom tags with constant attributes values', function() {
        const { view, rendered } = render( () => new SpreadCustomAttributesWithConst( '#root', 'spread-custom-attributes-with-const' ) );
        expect( view ).toBeLike( '<div><i>foo</i><i></i><i></i></div>' );

        view.update( {
            attr: {
                boo: 'boo',
                bar: 'bar'
            }
        } );
        expect( view ).toBe( '<div><i>foo</i><i>boo</i><i>bar</i></div>' );

        view.update( {
            attr: {
                foo: 'over foo'
            }
        } );
        expect( view ).toBe( '<div><i>over foo</i><i>boo</i><i>bar</i></div>' );
        expect( rendered ).toEqual( [
            'SpreadCustom',
            'spread-custom-attributes-with-const'
        ] );
    } );

    it( 'should work for custom tags with attributes with values', function() {
        const { view, rendered } = render( () => new SpreadCustomAttributesWithVar( '#root', 'spread-custom-attributes-with-var' ) );
        expect( view ).toBeLike( '<div></div>' );

        view.update( {
            attr: {
                boo: 'boo',
                bar: 'bar'
            }
        } );
        expect( view ).toBeLike( '<div><i></i><i>boo</i><i>bar</i></div>' );

        view.update( {
            foo: 'foo'
        } );
        expect( view ).toBe( '<div><i>foo</i><i>boo</i><i>bar</i></div>' );

        view.resetAndUpdate( {
            attr: {
                foo: 'over foo'
            }
        } );
        expect( view ).toBe( '<div><i>over foo</i><i>boo</i><i>bar</i></div>' );
        expect( rendered ).toEqual( [
            'spread-custom-attributes-with-var',
            'SpreadCustom'
        ] );
    } );

} );