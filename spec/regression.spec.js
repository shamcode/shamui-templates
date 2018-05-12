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

    it( 'should update all values', function() {
        {
            const { view, rendered } = render( () => new RegressionParentValues( '#root', 'regression-parent-values', {
                value: 1,
                on: true,
                each: [ 1, 2, 3 ]
            } ) );
            expect( view ).toBeLike( '<p>1</p><p>1</p><p>111</p>' );
            expect( rendered ).toEqual( [
                'RegressionParentValues_if0',
                'RegressionParentValues_for2',
                'RegressionParentValues_for2',
                'RegressionParentValues_for2',
                'regression-parent-values'
            ] );

            view.update( { value: 2 } );
            expect( view ).toBeLike( '<p>2</p><p>2</p><p>222</p>' );
            expect( rendered ).toEqual( [
                'RegressionParentValues_if0',
                'RegressionParentValues_for2',
                'RegressionParentValues_for2',
                'RegressionParentValues_for2',
                'regression-parent-values'
            ] );
        }


        {
            // Complex:
            const { view, rendered } = render( () => new RegressionParentValuesComplex( '#root', 'regression-parent-values-complex', {
                a: 2,
                b: 3,
                on: true,
                each: [ 1, 2 ]
            }  ) );
            expect( view ).toBeLike( '<p>5</p><p>-1</p><p>66</p>' );
            expect( rendered ).toEqual( [
                'RegressionParentValuesComplex_if0',
                'RegressionParentValuesComplex_for2',
                'RegressionParentValuesComplex_for2',
                'regression-parent-values-complex'
            ] );

            view.update( { a: 4 } );
            expect( view ).toBeLike( '<p>7</p><p>1</p><p>1212</p>' );
            expect( rendered ).toEqual( [
                'RegressionParentValuesComplex_if0',
                'RegressionParentValuesComplex_for2',
                'RegressionParentValuesComplex_for2',
                'regression-parent-values-complex'
            ] );

            view.update( { b: 1 } );
            expect( view ).toBeLike( '<p>5</p><p>3</p><p>44</p>' );
            expect( rendered ).toEqual( [
                'RegressionParentValuesComplex_if0',
                'RegressionParentValuesComplex_for2',
                'RegressionParentValuesComplex_for2',
                'regression-parent-values-complex'
            ] );

            view.update( { a: 2, b: 2 } );
            expect( view ).toBeLike( '<p>4</p><p>0</p><p>44</p>' );
            expect( rendered ).toEqual( [
                'RegressionParentValuesComplex_if0',
                'RegressionParentValuesComplex_for2',
                'RegressionParentValuesComplex_for2',
                'regression-parent-values-complex'
            ] );
        }
    } );

    it( 'should update variables in nested views', function() {
        const { view, rendered } = render( () => new RegressionNestedViews( '#root', 'regression-nested-views', {
            value: 1,
            on: true,
            each: [ 1, 2, 3 ]
        } ) );
        expect( view ).toBe( '<p>1<!--if-->1<!--if-->1<!--if--></p>' );
        expect( rendered ).toEqual( [
            'RegressionNestedViews_for0',
            'RegressionNestedViews_for0',
            'RegressionNestedViews_for0',
            'RegressionNestedViews_for0_if0',
            'RegressionNestedViews_for0_if0',
            'RegressionNestedViews_for0_if0',
            'regression-nested-views'
        ] );

        view.update( { value: 7 } );
        expect( view ).toBe( '<p>7<!--if-->7<!--if-->7<!--if--></p>' );
        expect( rendered ).toEqual( [
            'RegressionNestedViews_for0',
            'RegressionNestedViews_for0',
            'RegressionNestedViews_for0',
            'RegressionNestedViews_for0_if0',
            'RegressionNestedViews_for0_if0',
            'RegressionNestedViews_for0_if0',
            'regression-nested-views'
        ] );
    } );

    it( 'should work with first level non-elements', function() {
        const { view, rendered } = render( () => new FirstLevelStatements( '#root', 'first-level-statements', {
            cond: true,
            loop: [ 1, 2, 3 ],
            tag: true,
            xss: 'ok'
        } ) );
        expect( document.getElementById( 'root' ) ).toDOM(
            ' text <div class="if">ok</div><!--if--><div class="for">ok</div><div class="for">ok</div><div class="for">ok</div><!--for--><div class="custom">ok</div><!--first-level-tag--><i class="unsafe">ok</i><!--unsafe-->'
        );
        expect( rendered ).toEqual( [
            'FirstLevelStatements_if0',
            'FirstLevelStatements_for2',
            'FirstLevelStatements_for2',
            'FirstLevelStatements_for2',
            'first_level_tag',
            'first-level-statements'
        ] );
    } );

    it( 'should throw exception if user try to use querySelector on first level non-elements',
        function() {
            const { view, rendered } = render( () => new FirstLevelStatements( '#root', 'first-level-statements', {
                cond: true,
                loop: [ 1, 2, 3 ],
                tag: true,
                xss: 'ok'
            } ) );

            expect( rendered ).toEqual( [
                'FirstLevelStatements_if0',
                'FirstLevelStatements_for2',
                'FirstLevelStatements_for2',
                'FirstLevelStatements_for2',
                'first_level_tag',
                'first-level-statements'
            ] );
            expect( function() {
                view.querySelector( '.if' );
            } ).toThrow( new Error(
                'Can not use querySelector with non-element nodes on first level.' )
            );
        } );


    it( 'if with custom tag', function() {
        const { view, rendered } = render( () => new ReIfCustom( '#root', 're-if-custom', { test: true } ) );
        expect( view ).toBe( '<div><div> Custom tag </div><!--Tag--></div>' );
        expect( rendered ).toEqual( [
            'Tag',
            'ReIfCustom_if0',
            're-if-custom'
        ] );

        view.update( { test: false } );
        expect( view ).toBe( '<div></div>' );
        expect( rendered ).toEqual( [
            'Tag',
            'ReIfCustom_if0',
            're-if-custom'
        ] );

        view.update( { test: true } );
        expect( view ).toBe( '<div><div> Custom tag </div><!--Tag--></div>' );
        expect( rendered ).toEqual( [
            'Tag',
            'ReIfCustom_if0',
            're-if-custom',
            'Tag',
            'ReIfCustom_if0'
        ] );
    } );

    it( 'if with unsafe tag', function() {
        const { view, rendered } = render( () => new ReIfUnsafe( '#root', 're-if-unsafe', { test: true } ) );
        expect( view ).toBe( '<div><div><i>unsafe</i></div></div>' );
        expect( rendered ).toEqual( [
            'ReIfUnsafe_if0',
            're-if-unsafe'
        ] );

        view.update( { test: false } );
        expect( view ).toBe( '<div></div>' );
        expect( rendered ).toEqual( [
            'ReIfUnsafe_if0',
            're-if-unsafe'
        ] );

        view.update( { test: true } );
        expect( view ).toBe( '<div><div><i>unsafe</i></div></div>' );
        expect( rendered ).toEqual( [
            'ReIfUnsafe_if0',
            're-if-unsafe',
            'ReIfUnsafe_if0'
        ] );
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
