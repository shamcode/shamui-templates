describe( 'ShamUIView', function() {
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

    it( 'should render empty attributes', function() {
        const { view, rendered } = render( () => new EmptyAttr( '#root', 'empty-attr' ) );

        expect( view ).toBe( '<input type="checkbox" value="">' );
        expect( view.nodes[ 0 ].checked ).toEqual( true );
        expect( rendered ).toEqual( [
            'empty-attr'
        ] );
    } );

    it( 'should render attributes without quotes', function() {
        const { view, rendered } = render( () => new AttrWithoutQuotes( '#root', 'attr-without-quotes', { name: 'name' } ) );

        expect( view ).toBe( '<div class="name"></div>' );
        expect( rendered ).toEqual( [
            'attr-without-quotes'
        ] );
    } );

    it( 'should work querySelector', function() {
        const { view, rendered } = render( () => new Query( '#root', 'query' ) );

        expect( view.querySelector( '.foo' ).getAttribute( 'id' ) ).toEqual( 'one' );
        expect( view.querySelector( '.boo' ).getAttribute( 'id' ) ).toEqual( 'two' );
        expect( view.querySelector( '.baz' ).getAttribute( 'id' ) ).toEqual( 'three' );
        expect( rendered ).toEqual( [
            'query'
        ] );
    } );

    it( 'should support global variables', function() {
        {
            const { view, rendered } = render( () => new Globals( '#root', 'globals', {
                host: window.location.host
            } ) );
            expect( view ).toBeLike(
                '<i>expr, if<!--if-->, for<!--for-->, <i class="attr"></i>, custom<!--GlobalsCustom--></i>'
            );
            expect( rendered ).toEqual( [
                'Globals_if0',
                'Globals_for2',
                'GlobalsCustom',
                'globals'
            ] );
        }

        {
            const { view, rendered } = render( () => new GlobalsList( '#root', 'globals-list', {
                array: [ 1, 2, 3 ],
                obj: { a: 1, b: 2 }
            } ) );
            expect( view ).toBeLike( 'array, 4, a;b, {"a":1,"b":2}' );
            expect( rendered ).toEqual( [
                'globals-list'
            ] );
        }
    } );

    it( 'should support expressions without variables', function() {
        const { view, rendered } = render( () => new EmptyExpression( '#root', 'empty-expression' ) );
        expect( view ).toBe( '7' );
        expect( rendered ).toEqual( [
            'empty-expression'
        ] );
    } );

    it( 'should insert default values on render', function() {
        const { view, rendered } = render( () => new DefaultValue( '#root', 'default-value' ) );
        expect( view ).toBe( '<div class="default">empty</div>' );

        view.update( {
            id: null,
            foo: 'foo',
            boo: 'boo',
            content: 'content'
        } );
        expect( view ).toBe( '<div class="boo" id="foo">content</div>' );
        expect( rendered ).toEqual( [
            'default-value',
        ] );
    } );

    it( 'should ignore all html comments', function() {
        const { view, rendered } = render( () => new Comment( '#root', 'comment') );
        expect( view ).toBe( '<span>Moon</span>' );
        expect( rendered ).toEqual( [
            'comment',
        ] );
    } );

    it( 'should replace HTML entities with Unicode symbols', function() {
        const { view, rendered } = render( () => new HtmlEntity( '#root', 'html-entity' ) );
        expect( view ).toBe( ' "&amp;\'&lt;&gt;©£±¶ — € ♥&amp;notExists; ' );
        expect( rendered ).toEqual( [
            'html-entity'
        ] );
    } );
} );
