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

    it( 'should work for html elements', function() {
        const { view, rendered } = render( () => new SpreadElementAttributes( '#root', 'spread-element-attributes' ) );
        view.update( {
            attr: {
                id: 'id',
                'data-attr': 'data',
                'class': 'foo'
            }
        } );
        expect( view ).toBe( '<div id="id" data-attr="data" class="foo"></div>' );
        expect( rendered ).toEqual( [
            'spread-element-attributes'
        ] );
    } );

    it( 'should override default attributes', function() {
        const { view, rendered } = render( () => new SpreadAttributesOverride( '#root', 'spread-attributes-override' ) );
        expect( view ).toBe( '<div id="foo"></div>' );
        expect( rendered ).toEqual( [
            'spread-attributes-override'
        ] );

        view.update( {
            attr: {
                id: 'boo'
            }
        } );
        expect( view ).toBe( '<div id="boo"></div>' );
        expect( rendered ).toEqual( [
            'spread-attributes-override'
        ] );
    } );

    it( 'should override variables attributes', function() {
        const { view, rendered } = render( () => new SpreadAttributesWithVar( '#root', 'spread-attributes-with-var' ) );
        view.update( { id: "foo" } );
        expect( view ).toBe( '<div id="foo"></div>' );
        expect( rendered ).toEqual( [
            'spread-attributes-with-var'
        ] );

        view.update( {
            attr: {
                id: 'boo'
            }
        } );
        expect( view ).toBe( '<div id="boo"></div>' );
        expect( rendered ).toEqual( [
            'spread-attributes-with-var'
        ] );

        view.resetAndUpdate( { id: "bar" } );
        expect( view ).toBe( '<div id="bar"></div>' );
        expect( rendered ).toEqual( [
            'spread-attributes-with-var'
        ] );
    } );

    it( 'should work for custom tags', function() {
        const { view, rendered } = render( () => new SpreadCustomAttributes( '#root', 'spread-custom-attributes' ) );
        expect( rendered ).toEqual( [
            'SpreadCustom0',
            'spread-custom-attributes'
        ] );
        view.update( {
            attr: {
                foo: 'foo',
                boo: 'boo',
                bar: 'bar'
            }
        } );
        expect( view ).toBe( '<div><i>foo</i><i>boo</i><i>bar</i></div>' );
        expect( rendered ).toEqual( [
            'SpreadCustom0',
            'spread-custom-attributes'
        ] );

        view.update( {
            attr: {
                boo: 'Boo-Ya'
            }
        } );
        expect( view ).toBe( '<div><i>foo</i><i>Boo-Ya</i><i>bar</i></div>' );
        expect( rendered ).toEqual( [
            'SpreadCustom0',
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
            'SpreadCustom1',
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
            'SpreadCustom2'
        ] );
    } );

} );