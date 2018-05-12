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

    it( 'should render arrays', function() {
        const { view, rendered } = render( () => new Loop( '#root', 'loop', {
            list: [ 1, 2, 3 ]
        } ) );
        expect( view ).toBeLike( '<ul><li>0:1</li><li>1:2</li><li>2:3</li></ul>' );
        expect( rendered ).toEqual( [
            'Loop_for0',
            'Loop_for0',
            'Loop_for0',
            'loop'
        ] );

        view.update( { list: [ 1, 3 ] } );
        expect( view ).toBeLike( '<ul><li>0:1</li><li>1:3</li></ul>' );
        expect( rendered ).toEqual( [
            'Loop_for0',
            'Loop_for0',
            'Loop_for0',
            'loop'
        ] );

        view.update( { list: [ 'a', 'b', 'c', 'd' ] } );
        expect( view ).toBeLike( '<ul><li>0:a</li><li>1:b</li><li>2:c</li><li>3:d</li></ul>' );
        expect( rendered ).toEqual( [
            'Loop_for0',
            'Loop_for0',
            'Loop_for0',
            'loop',
            'Loop_for0',
            'Loop_for0',
        ] );
    } );

    it( 'should render arrays with externals', function() {
        const { view, rendered } = render( () => new LoopA( '#root', 'loop-a', {
            list: [ 1, 2, 3 ],
            ext: '.js'
        } ) );
        expect( view ).toBeLike( '<div><p>1.js</p><p>2.js</p><p>3.js</p></div>' );
        expect( rendered ).toEqual( [
            'LoopA_for0',
            'LoopA_for0',
            'LoopA_for0',
            'loop-a'
        ] );
    } );

    it( 'should iterate over objects', function() {
        const { view, rendered } = render( () => new LoopObject( '#root', 'loop-object', {
            obj: {
                a: 1,
                b: 2,
                c: 3
            }
        } ) );
        expect( view ).toBeLike( '<div>a: 1; b: 2; c: 3; </div>' );
        expect( rendered ).toEqual( [
            'LoopObject_for0',
            'LoopObject_for0',
            'LoopObject_for0',
            'loop-object'
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
            'LoopObject_for0',
            'LoopObject_for0',
            'LoopObject_for0',
            'loop-object'
        ] );
    } );

    it( 'should iterate over arrays without options', function() {
        const { view, rendered } = render( () => new LoopObjectWithoutOptions( '#root', 'loop-object-without-options', {
            obj: [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]
        } ) );
        expect( view ).toBeLike( '<div>a; b; c; </div>' );
        expect( rendered ).toEqual( [
            'LoopObjectWithoutOptions_for0',
            'LoopObjectWithoutOptions_for0',
            'LoopObjectWithoutOptions_for0',
            'loop-object-without-options'
        ] );
    } );

    it( 'should iterate over objects without options', function() {
        const { view, rendered } = render( () => new LoopObjectWithoutOptions( '#root', 'loop-object-without-options', {
            obj: {
                a: { name: 'a' },
                b: { name: 'b' },
                c: { name: 'c' }
            }
        } ) );
        expect( view ).toBeLike( '<div>a; b; c; </div>' );
        expect( rendered ).toEqual( [
            'LoopObjectWithoutOptions_for0',
            'LoopObjectWithoutOptions_for0',
            'LoopObjectWithoutOptions_for0',
            'loop-object-without-options'
        ] );
    } );

    it( 'should delete old items from childred map with custom tag', function() {
        const { view, rendered } = render( () => new LoopWithCustomTag( '#root', 'loop-with-custom-tag', {
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
        }  ) );
        expect( view ).toBe(
            '<div><ul><li>1:a</li><!--MyLi--><li>2:b</li><!--MyLi--><li>3:c</li><!--MyLi--></ul></div>'
        );
        expect( rendered ).toEqual( [
            'MyUl',
            'MyUl_for0',
            'MyUl_for0',
            'MyUl_for0',
            'MyLi',
            'MyLi',
            'MyLi',
            'loop-with-custom-tag'
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
            'MyUl',
            'MyUl_for0',
            'MyUl_for0',
            'MyUl_for0',
            'MyLi',
            'MyLi',
            'MyLi',
            'loop-with-custom-tag'
        ] );
    } );

    it( 'should not expose local variables', function() {
        const { view, rendered } = render( () => new LoopLocaleVariableExpose( '#root', 'loop-locale-variable-expose', {
            as: [ 'a', 'b' ],
            bs: [ 1, 2 ],
            b: 'GLOBAL'
        } ) );
        expect( view ).toBeLike(
            '<section><i><b>1</b><b>2</b></i><i><b>1</b><b>2</b></i></section>'
        );
        expect( rendered ).toEqual( [
            'LoopLocaleVariableExpose_for0',
            'LoopLocaleVariableExpose_for0',
            'LoopLocaleVariableExpose_for0_for0',
            'LoopLocaleVariableExpose_for0_for0',
            'LoopLocaleVariableExpose_for0_for0',
            'LoopLocaleVariableExpose_for0_for0',
            'loop-locale-variable-expose'
        ] );
    } );
} );