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