describe( 'For tags', function() {
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

    it( 'should render arrays', function() {
        const { view, rendered } = render( () => new Loop( '#root', 'loop' ) );
        expect( rendered ).toEqual( [
            'loop'
        ] );
        view.update( { list: [ 1, 2, 3 ] } );
        expect( view ).toBeLike( '<ul><li>0:1</li><li>1:2</li><li>2:3</li></ul>' );
        expect( rendered ).toEqual( [
            'loop',
            'Loop_for00',
            'Loop_for01',
            'Loop_for02'
        ] );

        view.update( { list: [ 1, 3 ] } );
        expect( view ).toBeLike( '<ul><li>0:1</li><li>1:3</li></ul>' );
        expect( rendered ).toEqual( [
            'loop',
            'Loop_for00',
            'Loop_for01',
            'Loop_for02'
        ] );

        view.update( { list: [ 'a', 'b', 'c', 'd' ] } );
        expect( view ).toBeLike( '<ul><li>0:a</li><li>1:b</li><li>2:c</li><li>3:d</li></ul>' );
        expect( rendered ).toEqual( [
            'loop',
            'Loop_for00',
            'Loop_for01',
            'Loop_for02',
            'Loop_for03',
            'Loop_for04'
        ] );
    } );

    it( 'should render arrays with externals', function() {
        const { view, rendered } = render( () => new LoopA( '#root', 'loop-a' ) );
        expect( rendered ).toEqual( [
            'loop-a'
        ] );
        view.update( { list: [ 1, 2, 3 ], ext: '.js' } );
        expect( view ).toBeLike( '<div><p>1.js</p><p>2.js</p><p>3.js</p></div>' );
        expect( rendered ).toEqual( [
            'loop-a',
            'LoopA_for00',
            'LoopA_for01',
            'LoopA_for02'
        ] );
    } );

    it( 'should iterate over objects', function() {
        const { view, rendered } = render( () => new LoopObject( '#root', 'loop-object' ) );
        expect( rendered ).toEqual( [
            'loop-object'
        ] );
        view.update( {
            obj: {
                a: 1,
                b: 2,
                c: 3
            }
        } );
        expect( view ).toBeLike( '<div>a: 1; b: 2; c: 3; </div>' );
        expect( rendered ).toEqual( [
            'loop-object',
            'LoopObject_for00',
            'LoopObject_for01',
            'LoopObject_for02'
        ] );

        view.update( {
            obj: {
                a: 1,
                c: 3,
                d: 4
            }
        } );
        expect( view ).toBeLike( '<div>a: 1; c: 3; d: 4; </div>' );
        expect( rendered ).toEqual( [
            'loop-object',
            'LoopObject_for00',
            'LoopObject_for01',
            'LoopObject_for02'
        ] );
    } );

    it( 'should iterate over arrays without options', function() {
        const { view, rendered } = render( () => new LoopObjectWithoutOptions( '#root', 'loop-object-without-options' ) );
        expect( rendered ).toEqual( [
            'loop-object-without-options'
        ] );
        view.update( {
            obj: [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]
        } );
        expect( view ).toBeLike( '<div>a; b; c; </div>' );
        expect( rendered ).toEqual( [
            'loop-object-without-options',
            'LoopObjectWithoutOptions_for00',
            'LoopObjectWithoutOptions_for01',
            'LoopObjectWithoutOptions_for02'
        ] );
    } );

    it( 'should iterate over objects without options', function() {
        const { view, rendered } = render( () => new LoopObjectWithoutOptions( '#root', 'loop-object-without-options' ) );
        expect( rendered ).toEqual( [
            'loop-object-without-options'
        ] );
        view.update( {
            obj: {
                a: { name: 'a' },
                b: { name: 'b' },
                c: { name: 'c' }
            }
        } );
        expect( view ).toBeLike( '<div>a; b; c; </div>' );
        expect( rendered ).toEqual( [
            'loop-object-without-options',
            'LoopObjectWithoutOptions_for03',
            'LoopObjectWithoutOptions_for04',
            'LoopObjectWithoutOptions_for05'
        ] );
    } );

    it( 'should delete old items from childred map with custom tag', function() {
        const { view, rendered } = render( () => new LoopWithCustomTag( '#root', 'loop-with-custom-tag' ) );
        expect( rendered ).toEqual( [
            'loop-with-custom-tag'
        ] );
        view.update( {
            list: [
                {
                    id: 1,
                    value: 'a'
                },
                {
                    id: 2,
                    value: 'b'
                },
                {
                    id: 3,
                    value: 'c'
                }
            ]
        } );
        expect( view ).toBe(
            '<div><ul><li>1:a</li><!--MyLi--><li>2:b</li><!--MyLi--><li>3:c</li><!--MyLi--></ul></div>'
        );
        expect( rendered ).toEqual( [
            'loop-with-custom-tag',
            'MyUl0',
            'MyUl_for00',
            'MyUl_for01',
            'MyUl_for02',
            'MyLi0',
            'MyLi1',
            'MyLi2'
        ] );

        view.update( {
            list: [
                {
                    id: 1,
                    value: 'a'
                },
                {
                    id: 3,
                    value: 'c'
                }
            ]
        } );
        expect( view ).toBe( '<div><ul><li>1:a</li><!--MyLi--><li>3:c</li><!--MyLi--></ul></div>' );
        expect( rendered ).toEqual( [
            'loop-with-custom-tag',
            'MyUl0',
            'MyUl_for00',
            'MyUl_for01',
            'MyUl_for02',
            'MyLi0',
            'MyLi1',
            'MyLi2'
        ] );
    } );

    it( 'should not expose local variables', function() {
        const { view, rendered } = render( () => new LoopLocaleVariableExpose( '#root', 'loop-locale-variable-expose' ) );
        expect( rendered ).toEqual( [
            'loop-locale-variable-expose'
        ] );
        view.update( {
            as: [ 'a', 'b' ],
            bs: [ 1, 2 ],
            b: 'GLOBAL'
        } );
        expect( view ).toBeLike(
            '<section><i><b>1</b><b>2</b></i><i><b>1</b><b>2</b></i></section>'
        );
        expect( rendered ).toEqual( [
            'loop-locale-variable-expose',
            'LoopLocaleVariableExpose_for00',
            'LoopLocaleVariableExpose_for01',
            'LoopLocaleVariableExpose_for0_for00',
            'LoopLocaleVariableExpose_for0_for01',
            'LoopLocaleVariableExpose_for0_for02',
            'LoopLocaleVariableExpose_for0_for03'
        ] );
    } );
} );