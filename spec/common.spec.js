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

    it( 'should render simple DOM', function() {
        const { view, rendered } = render( () => new SimpleDom( '#root', 'simple-dom' ) );
        expect( view ).toBe( '<div> ShamUIView Moon Delight </div>' );
        expect( rendered ).toEqual( [
            'simple-dom'
        ] )
    } );

    it( 'should insert variable as text node', function() {
        const { view, rendered } = render( () => new TextNode( '#root', 'text-node', {
            text: 'To understand what recursion is, you must first understand recursion.'
        } ) );
        expect( view ).toBe(
            '<p>To understand what recursion is, you must first understand recursion.</p>'
        );
        expect( rendered ).toEqual( [
            'text-node'
        ] );
    } );

    it( 'should insert variable in attributes', function() {
        const { view, rendered } = render( () => new AttributeVariable( '#root', 'attribute-variable', {
            value: 'Value'
        } ) );
        expect( view.nodes[ 0 ].value ).toEqual( 'Value' );
        expect( rendered ).toEqual( [
            'attribute-variable'
        ] );
    } );

    it( 'should properly work with text constants in text nodes', function() {
        const { view, rendered } = render( () => new TextNodeAround( '#root', 'text-node-around', {
            bar: 'bar'
        } ) );
        expect( view ).toBeLike( '<p>foo bar baz</p>' );
        expect( rendered ).toEqual( [
            'text-node-around'
        ] );
    } );

    it( 'should properly work with text constants in attributes', function() {
        const { view, rendered } = render(
            () => new AttributeVariableAround( '#root', 'attribute-variable-around', {
                bar: 'bar'
            } )
        );
        expect( view ).toBe( '<div class="foo bar baz"></div>' );
        expect( rendered ).toEqual( [
            'attribute-variable-around'
        ] );
    } );

    it( 'should save value for variables in complex cases', function() {
        const { rendered, view } = render(
            () => new ComplexSpotWithTwoVariables( '#root', 'complex-spot-with-two-variables', {
                foo: 'first',
                bar: 'second'
            } )
        );
        expect( view ).toBe( '<div class="first second"></div>' );
        expect( rendered ).toEqual( [
            'complex-spot-with-two-variables'
        ] );

        view.update( {
            foo: 'updated'
        } );

        expect( view ).toBe( '<div class="updated second"></div>' );
        expect( rendered ).toEqual( [
            'complex-spot-with-two-variables'
        ] );
    } );

    it( 'should properly work with more then one node on topmost level', function() {
        const { view, rendered } = render(
            () => new TwoTopLevelNodes( '#root', 'two-top-level-nodes' )
        );
        expect( view ).toBe( '<p>first</p><p>second</p>' );
        expect( rendered ).toEqual( [
            'two-top-level-nodes'
        ] );
    } );

    it( 'should optimize "if"/"for" tag, if it is only child', function() {
        const { view, rendered } = render( () => new CommonIf( '#root', 'common-if', {
            a: true,
            b: [ 1 ]
        } ) );
        expect( view ).toBe( '<div><p>a</p><p>b</p></div>' );
        expect( rendered ).toEqual( [
            'CommonIf_if0',
            'CommonIf_for2',
            'common-if'
        ] );
    } );

    it( 'should place placeholders for multiply "if" tags', function() {
        const { view, rendered } = render(
            () => new CommonIfWithPlaceholders( '#root', 'common-if-with-placeholders' )
        );
        expect( view ).toBe( '<div><!--if--><!--if--></div>' );
        expect( rendered ).toEqual( [
            'common-if-with-placeholders'
        ] );
    } );

    it( 'should place placeholders for multiply "if" and "for" tags', function() {
        const { view, rendered } = render(
            () => new CommonInFor( '#root', 'common-in-for' )
        );
        expect( view ).toBe( '<div><!--if--><!--for--></div>' );
        expect( rendered ).toEqual( [
            'common-in-for'
        ] );
    } );

    it( 'should properly for with filters', function() {
        const filters = {
            append: function( value, text ) {
                return value + text;
            },
            upperCase: function( value ) {
                return value.toUpperCase();
            }
        };

        const { view, rendered } = render(
            () => new CommonFilters( '#root', 'common-filters', { filters, text: 'upper_' } )
        );

        expect( view ).toBe( '<p>UPPER_CASE</p>' );
        expect( rendered ).toEqual( [
            'common-filters'
        ] );
    } );

    it( 'should work with expressions', function() {
        const { view, rendered } = render( () => new CommonExpressions( '#root', 'common-expressions', {
            a: 1,
            b: 2,
            c: 100,
            d: 2,
            more: {
                amazing: 'a'
            },
            features: [ 'b', 'c' ]
        } ) );
        expect( view ).toBe( '<a title="150">abc</a>' );
        expect( rendered ).toEqual( [
            'common-expressions'
        ] );

        view.update( { more: { amazing: 'Amazing!' } } );

        expect( view ).toBe( '<a title="150">Amazing!bc</a>' );
        expect( rendered ).toEqual( [
            'common-expressions'
        ] );
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
