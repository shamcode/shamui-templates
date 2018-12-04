describe( 'Regression', function() {
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

    it( 'if with custom tag', function() {
        const { view, rendered } = render( () => new ReForCustom( '#root', 're-for-custom', { array: [ 1, 2, 3 ] } ) );
        expect( view ).toBe(
            '<div><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--></div>'
        );
        expect( rendered ).toEqual( [
            'Tag',
            'ReForCustom_for0',
            'Tag',
            'ReForCustom_for0',
            'Tag',
            'ReForCustom_for0',
            're-for-custom'
        ] );

        view.update( { array: [] } );
        expect( view ).toBe( '<div></div>' );
        expect( rendered ).toEqual( [
            'Tag',
            'ReForCustom_for0',
            'Tag',
            'ReForCustom_for0',
            'Tag',
            'ReForCustom_for0',
            're-for-custom'
        ] );

        view.update( { array: [ 1, 3 ] } );
        expect( view )
            .toBe( '<div><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--></div>'
        );
        expect( rendered ).toEqual( [
            'Tag',
            'ReForCustom_for0',
            'Tag',
            'ReForCustom_for0',
            'Tag',
            'ReForCustom_for0',
            're-for-custom',
            'Tag',
            'ReForCustom_for0',
            'Tag',
            'ReForCustom_for0'
        ] );
    } );

    it( 'update loops in custom tags', function() {
        const { view, rendered } = render( () => new UpdateLoopsInCustomTags( '#root', 'update-loops-in-custom-tags', {
            foo: 'foo',
            bar: 'bar',
            list: [ 1, 2, 3 ]
        }  ) );
        expect( view ).toBe(
            '<i><em><b class="foobar">1</b><b class="foobar">2</b><b class="foobar">3</b></em></i>'
        );
        expect( rendered ).toEqual( [
            'custom_tag_with_loop',
            'custom_tag_with_loop_for0',
            'custom_tag_with_loop_for0',
            'custom_tag_with_loop_for0',
            'update-loops-in-custom-tags'
        ] );
    } );

    it( 'should not update variables what exists only in inner scope', function() {
        const { view, rendered } = render( () => new UpdateLocalVars( '#root', 'update-local-vars', {
            list: [ [ 1 ], [ 2 ], [ 3 ] ],
            t1: 'bug?'
        } ) );

        expect( view )
            .toBe( '<p><i>1</i><!--for--><i>2</i><!--for--><i>3</i><!--for--><!--for--></p>'
        );
        expect( rendered ).toEqual( [
            'UpdateLocalVars_if0',
            'UpdateLocalVars_if0_for0',
            'UpdateLocalVars_if0_for0',
            'UpdateLocalVars_if0_for0',
            'UpdateLocalVars_if0_for0_for0',
            'UpdateLocalVars_if0_for0_for0',
            'UpdateLocalVars_if0_for0_for0',
            'UpdateLocalVars_if0_for0_for0',
            'UpdateLocalVars_if0_for0_for0',
            'UpdateLocalVars_if0_for0_for0',
            'UpdateLocalVars_if0_for0_for0',
            'UpdateLocalVars_if0_for0_for0',
            'UpdateLocalVars_if0_for0_for0',
            'UpdateLocalVars_if0_for0_for0',
            'UpdateLocalVars_if0_for0_for0',
            'UpdateLocalVars_if0_for0_for0',
            'update-local-vars'
        ] );
    } );

    it( 'should cache options variable data for loops', function() {
        const { view, rendered } = render( () => new ReLoopOptionsCache( '#root', 're-loop-options-cache', {
            "currency": "USD",
            "locale": "en",
            "currencies": { "USD": { "name": "US dollar" }, "EUR": { "name": "Euro" }, "AUD": { "name": "Australian dollar" } }
        } ) );

        expect( view ).toBe(
            '<ul><li class="selected"><span>USD</span>: US dollar</li><!--if--><li><span>EUR</span>: Euro</li><!--if--><li><span>AUD</span>: Australian dollar</li><!--if--></ul>' );


        var data2 = {
            "currency": "AUD",
            "locale": "en",
            "currencies": { "USD": { "name": "US dollar" }, "EUR": { "name": "Euro" }, "AUD": { "name": "Australian dollar" } }
        };

        view.update( data2 );
        expect( view ).toBe(
            '<ul><li><span>USD</span>: US dollar</li><!--if--><li><span>EUR</span>: Euro</li><!--if--><li class="selected"><span>AUD</span>: Australian dollar</li><!--if--></ul>' );

        expect( rendered ).toEqual( [
            'ReLoopOptionsCache_for0',
            'ReLoopOptionsCache_for0',
            'ReLoopOptionsCache_for0',
            'ReLoopOptionsCache_for0_if0',
            'ReLoopOptionsCache_for0_else1',
            'ReLoopOptionsCache_for0_else1',
            're-loop-options-cache',
            'ReLoopOptionsCache_for0_else1',
            'ReLoopOptionsCache_for0_if0'
        ] );
    } );

    it( 'loos should update two levels loops once', function() {
        var data = {
            colors: [
                {
                    colors: [
                        { color: 'red' },
                        { color: 'green' },
                        { color: 'blue' }
                    ]
                },
                {
                    colors: [
                        { color: 'red' },
                        { color: 'green' },
                        { color: 'blue' }
                    ]
                }
            ],
            color: { color: 'black' }
        };

        {
            const { view, rendered } = render( () => new ReLoopMustNotMutateData( '#root', 're-loop-must-not-mutate-data', data ) );
            expect( view ).toBe(
                '<ol><li>red</li><li>green</li><li>blue</li><!--for--><li>red</li><li>green</li><li>blue</li><!--for--></ol>' );
            expect( rendered ).toEqual( [
                'ReLoopMustNotMutateData_for0',
                'ReLoopMustNotMutateData_for0',
                'ReLoopMustNotMutateData_for0_for0',
                'ReLoopMustNotMutateData_for0_for0',
                'ReLoopMustNotMutateData_for0_for0',
                'ReLoopMustNotMutateData_for0_for0',
                'ReLoopMustNotMutateData_for0_for0',
                'ReLoopMustNotMutateData_for0_for0',
                're-loop-must-not-mutate-data'
            ] );
        }

        {
            const { view, rendered } = render( () => new ReLoopMustWorkWithSameNameLoops( '#root', 're-loop-must-work-with-same-name-loops', data ) );
            expect( view ).toBe(
                '<ol><li>red</li><li>green</li><li>blue</li><!--for--><li>red</li><li>green</li><li>blue</li><!--for--></ol>' );
            expect( rendered ).toEqual( [
                'ReLoopMustWorkWithSameNameLoops_for0',
                'ReLoopMustWorkWithSameNameLoops_for0',
                'ReLoopMustWorkWithSameNameLoops_for0_for0',
                'ReLoopMustWorkWithSameNameLoops_for0_for0',
                'ReLoopMustWorkWithSameNameLoops_for0_for0',
                'ReLoopMustWorkWithSameNameLoops_for0_for0',
                'ReLoopMustWorkWithSameNameLoops_for0_for0',
                'ReLoopMustWorkWithSameNameLoops_for0_for0',
                're-loop-must-work-with-same-name-loops'
            ] );
        }
    } );

    it( 'loops with cond and outer scope', function() {
        const { view, rendered } = render( () => new ReLoopWithIfAndOuterScope( '#root', 're-loop-with-id-and-outer-scope', {
            outer: "outer",
            attributes: [
                {
                    name: "name1",
                    value: "value1"
                },
                {
                    name: "name2",
                    value: "value2"
                }
            ]
        } ) );

        expect( view ).toBe(
            '<div><span>name1</span><span>value1</span><span>outer</span><!--if--><span>name2</span><span>value2</span><span>outer</span><!--if--></div>'
        );
        view.update( {
            outer: "outer2"
        } );
        expect( view ).toBe(
            '<div><span>name1</span><span>value1</span><span>outer2</span><!--if--><span>name2</span><span>value2</span><span>outer2</span><!--if--></div>'
        );
        expect( rendered ).toEqual( [
            'ReLoopWithIfAndOuterScope_for0',
            'ReLoopWithIfAndOuterScope_for0',
            'ReLoopWithIfAndOuterScope_for0_if0',
            'ReLoopWithIfAndOuterScope_for0_if0',
            're-loop-with-id-and-outer-scope'
        ] );
    } );

} );
