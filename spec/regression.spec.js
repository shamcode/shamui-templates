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

    it( 'should update all values', function() {
        {
            const { view, rendered } = render( () => new RegressionParentValues( '#root', 'regression-parent-values' ) );
            expect( rendered ).toEqual( [
                'regression-parent-values'
            ] );
            view.update( {
                value: 1,
                on: true,
                each: [ 1, 2, 3 ]
            } );
            expect( view ).toBeLike( '<p>1</p><p>1</p><p>111</p>' );
            expect( rendered ).toEqual( [
                'regression-parent-values',
                'RegressionParentValues_if00',
                'RegressionParentValues_for20',
                'RegressionParentValues_for21',
                'RegressionParentValues_for22'
            ] );

            view.update( { value: 2 } );
            expect( view ).toBeLike( '<p>2</p><p>2</p><p>222</p>' );
            expect( rendered ).toEqual( [
                'regression-parent-values',
                'RegressionParentValues_if00',
                'RegressionParentValues_for20',
                'RegressionParentValues_for21',
                'RegressionParentValues_for22'
            ] );
        }


        {
            // Complex:
            const { view, rendered } = render( () => new RegressionParentValuesComplex( '#root', 'regression-parent-values-complex' ) );
            expect( rendered ).toEqual( [
                'regression-parent-values-complex'
            ] );
            view.update( {
                a: 2,
                b: 3,
                on: true,
                each: [ 1, 2 ]
            } );
            expect( view ).toBeLike( '<p>5</p><p>-1</p><p>66</p>' );
            expect( rendered ).toEqual( [
                'regression-parent-values-complex',
                'RegressionParentValuesComplex_if00',
                'RegressionParentValuesComplex_for20',
                'RegressionParentValuesComplex_for21'
            ] );

            view.update( { a: 4 } );
            expect( view ).toBeLike( '<p>7</p><p>1</p><p>1212</p>' );
            expect( rendered ).toEqual( [
                'regression-parent-values-complex',
                'RegressionParentValuesComplex_if00',
                'RegressionParentValuesComplex_for20',
                'RegressionParentValuesComplex_for21'
            ] );

            view.update( { b: 1 } );
            expect( view ).toBeLike( '<p>5</p><p>3</p><p>44</p>' );
            expect( rendered ).toEqual( [
                'regression-parent-values-complex',
                'RegressionParentValuesComplex_if00',
                'RegressionParentValuesComplex_for20',
                'RegressionParentValuesComplex_for21'
            ] );

            view.update( { a: 2, b: 2 } );
            expect( view ).toBeLike( '<p>4</p><p>0</p><p>44</p>' );
            expect( rendered ).toEqual( [
                'regression-parent-values-complex',
                'RegressionParentValuesComplex_if00',
                'RegressionParentValuesComplex_for20',
                'RegressionParentValuesComplex_for21'
            ] );
        }
    } );

    it( 'should update variables in nested views', function() {
        const { view, rendered } = render( () => new RegressionNestedViews( '#root', 'regression-nested-views' ) );
        expect( rendered ).toEqual( [
            'regression-nested-views'
        ] );
        view.update( {
            value: 1,
            on: true,
            each: [ 1, 2, 3 ]
        } );
        expect( view ).toBe( '<p>1<!--if-->1<!--if-->1<!--if--></p>' );
        expect( rendered ).toEqual( [
            'regression-nested-views',
            'RegressionNestedViews_for00',
            'RegressionNestedViews_for01',
            'RegressionNestedViews_for02',
            'RegressionNestedViews_for0_if00',
            'RegressionNestedViews_for0_if01',
            'RegressionNestedViews_for0_if02'
        ] );

        view.update( { value: 7 } );
        expect( view ).toBe( '<p>7<!--if-->7<!--if-->7<!--if--></p>' );
        expect( rendered ).toEqual( [
            'regression-nested-views',
            'RegressionNestedViews_for00',
            'RegressionNestedViews_for01',
            'RegressionNestedViews_for02',
            'RegressionNestedViews_for0_if00',
            'RegressionNestedViews_for0_if01',
            'RegressionNestedViews_for0_if02'
        ] );
    } );

    it( 'should work with first level non-elements', function() {
        const { view, rendered } = render( () => new FirstLevelStatements( '#root', 'first-level-statements' ) );
        expect( rendered ).toEqual( [
            'first-level-statements'
        ] );
        view.update( {
            cond: true,
            loop: [ 1, 2, 3 ],
            tag: true,
            xss: 'ok'
        } );
        expect( document.getElementById( 'root' ) ).toDOM(
            ' text <div class="if">ok</div><!--if--><div class="for">ok</div><div class="for">ok</div><div class="for">ok</div><!--for--><div class="custom">ok</div><!--first-level-tag--><i class="unsafe">ok</i><!--unsafe-->'
        );
        expect( rendered ).toEqual( [
            'first-level-statements',
            'FirstLevelStatements_if00',
            'FirstLevelStatements_for20',
            'FirstLevelStatements_for21',
            'FirstLevelStatements_for22',
            'first_level_tag0'
        ] );
    } );

    it( 'should throw exception if user try to use querySelector on first level non-elements',
        function() {
            const { view, rendered } = render( () => new FirstLevelStatements( '#root', 'first-level-statements' ) );
            expect( rendered ).toEqual( [
                'first-level-statements'
            ] );
            view.update( {
                cond: true,
                loop: [ 1, 2, 3 ],
                tag: true,
                xss: 'ok'
            } );

            expect( rendered ).toEqual( [
                'first-level-statements',
                'FirstLevelStatements_if01',
                'FirstLevelStatements_for23',
                'FirstLevelStatements_for24',
                'FirstLevelStatements_for25',
                'first_level_tag1'
            ] );
            expect( function() {
                view.querySelector( '.if' );
            } ).toThrow( new Error(
                'Can not use querySelector with non-element nodes on first level.' ) );
        } );


    it( 'if with custom tag', function() {
        const { view, rendered } = render( () => new ReIfCustom( '#root', 're-if-custom' ) );
        expect( rendered ).toEqual( [
            're-if-custom'
        ] );
        view.update( { test: true } );
        expect( view ).toBe( '<div><div> Custom tag </div><!--Tag--></div>' );
        expect( rendered ).toEqual( [
            're-if-custom',
            'Tag0',
            'ReIfCustom_if00'
        ] );

        view.update( { test: false } );
        expect( view ).toBe( '<div></div>' );
        expect( rendered ).toEqual( [
            're-if-custom',
            'Tag0',
            'ReIfCustom_if00'
        ] );

        view.update( { test: true } );
        expect( view ).toBe( '<div><div> Custom tag </div><!--Tag--></div>' );
        expect( rendered ).toEqual( [
            're-if-custom',
            'Tag0',
            'ReIfCustom_if00',
            'Tag1',
            'ReIfCustom_if01'
        ] );
    } );

    it( 'if with unsafe tag', function() {
        const { view, rendered } = render( () => new ReIfUnsafe( '#root', 're-if-unsafe' ) );
        expect( rendered ).toEqual( [
            're-if-unsafe'
        ] );
        view.update( { test: true } );
        expect( view ).toBe( '<div><div><i>unsafe</i></div></div>' );
        expect( rendered ).toEqual( [
            're-if-unsafe',
            'ReIfUnsafe_if00'
        ] );

        view.update( { test: false } );
        expect( view ).toBe( '<div></div>' );
        expect( rendered ).toEqual( [
            're-if-unsafe',
            'ReIfUnsafe_if00'
        ] );

        view.update( { test: true } );
        expect( view ).toBe( '<div><div><i>unsafe</i></div></div>' );
        expect( rendered ).toEqual( [
            're-if-unsafe',
            'ReIfUnsafe_if00',
            'ReIfUnsafe_if01'
        ] );
    } );

    it( 'if with custom tag', function() {
        const { view, rendered } = render( () => new ReForCustom( '#root', 're-for-custom' ) );
        expect( rendered ).toEqual( [
            're-for-custom'
        ] );
        view.update( { array: [ 1, 2, 3 ] } );
        expect( view ).toBe(
            '<div><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--></div>'
        );
        expect( rendered ).toEqual( [
            're-for-custom',
            'Tag2',
            'ReForCustom_for00',
            'Tag3',
            'ReForCustom_for01',
            'Tag4',
            'ReForCustom_for02'
        ] );

        view.update( { array: [] } );
        expect( view ).toBe( '<div></div>' );
        expect( rendered ).toEqual( [
            're-for-custom',
            'Tag2',
            'ReForCustom_for00',
            'Tag3',
            'ReForCustom_for01',
            'Tag4',
            'ReForCustom_for02'
        ] );

        view.update( { array: [ 1, 3 ] } );
        expect( view )
            .toBe( '<div><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--></div>'
        );
        expect( rendered ).toEqual( [
            're-for-custom',
            'Tag2',
            'ReForCustom_for00',
            'Tag3',
            'ReForCustom_for01',
            'Tag4',
            'ReForCustom_for02',
            'Tag5',
            'ReForCustom_for03',
            'Tag6',
            'ReForCustom_for04'
        ] );
    } );

    it( 'update loops in custom tags', function() {
        const { view, rendered } = render( () => new UpdateLoopsInCustomTags( '#root', 'update-loops-in-custom-tags' ) );
        expect( rendered ).toEqual( [
            'update-loops-in-custom-tags'
        ] );
        view.update( {
            foo: 'foo',
            bar: 'bar',
            list: [ 1, 2, 3 ]
        } );
        expect( view ).toBe(
            '<i><em><b class="foobar">1</b><b class="foobar">2</b><b class="foobar">3</b></em></i>'
        );
        expect( rendered ).toEqual( [
            'update-loops-in-custom-tags',
            'custom_tag_with_loop0',
            'custom_tag_with_loop_for00',
            'custom_tag_with_loop_for01',
            'custom_tag_with_loop_for02'
        ] );
    } );

    it( 'should not update variables what exists only in inner scope', function() {
        const { view, rendered } = render( () => new UpdateLocalVars( '#root', 'update-local-vars' ) );
        expect( rendered ).toEqual( [
            'update-local-vars'
        ] );
        const data = {
            list: [ [ 1 ], [ 2 ], [ 3 ] ],
            t1: 'bug?'
        };
        view.update( data );

        expect( view )
            .toBe( '<p><i>1</i><!--for--><i>2</i><!--for--><i>3</i><!--for--><!--for--></p>'
        );
        expect( rendered ).toEqual( [
            'update-local-vars',
            'UpdateLocalVars_if00',
            'UpdateLocalVars_if0_for00',
            'UpdateLocalVars_if0_for01',
            'UpdateLocalVars_if0_for02',
            'UpdateLocalVars_if0_for0_for00',
            'UpdateLocalVars_if0_for0_for01',
            'UpdateLocalVars_if0_for0_for02',
            'UpdateLocalVars_if0_for0_for03',
            'UpdateLocalVars_if0_for0_for04',
            'UpdateLocalVars_if0_for0_for05',
            'UpdateLocalVars_if0_for0_for06',
            'UpdateLocalVars_if0_for0_for07',
            'UpdateLocalVars_if0_for0_for08',
            'UpdateLocalVars_if0_for0_for09',
            'UpdateLocalVars_if0_for0_for010',
            'UpdateLocalVars_if0_for0_for011'
        ] );
    } );

    it( 'should cache options variable data for loops', function() {
        const { view, rendered } = render( () => new ReLoopOptionsCache( '#root', 're-loop-options-cache' ) );

        var data1 = {
            "currency": "USD",
            "locale": "en",
            "currencies": { "USD": { "name": "US dollar" }, "EUR": { "name": "Euro" }, "AUD": { "name": "Australian dollar" } }
        };

        view.update( data1 );
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
            're-loop-options-cache',
            'ReLoopOptionsCache_for00',
            'ReLoopOptionsCache_for01',
            'ReLoopOptionsCache_for02',
            'ReLoopOptionsCache_for0_if00',
            'ReLoopOptionsCache_for0_else10',
            'ReLoopOptionsCache_for0_else11',
            'ReLoopOptionsCache_for0_else12',
            'ReLoopOptionsCache_for0_if01'
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
            const { view, rendered } = render( () => new ReLoopMustNotMutateData( '#root', 're-loop-must-not-mutate-data' ) );
            view.update( data );
            expect( view ).toBe(
                '<ol><li>red</li><li>green</li><li>blue</li><!--for--><li>red</li><li>green</li><li>blue</li><!--for--></ol>' );
            expect( rendered ).toEqual( [
                're-loop-must-not-mutate-data',
                'ReLoopMustNotMutateData_for00',
                'ReLoopMustNotMutateData_for01',
                'ReLoopMustNotMutateData_for0_for00',
                'ReLoopMustNotMutateData_for0_for01',
                'ReLoopMustNotMutateData_for0_for02',
                'ReLoopMustNotMutateData_for0_for03',
                'ReLoopMustNotMutateData_for0_for04',
                'ReLoopMustNotMutateData_for0_for05'
            ] );
        }

        {
            const { view, rendered } = render( () => new ReLoopMustWorkWithSameNameLoops( '#root', 're-loop-must-work-with-same-name-loops' ) );
            view.update( data );
            expect( view ).toBe(
                '<ol><li>red</li><li>green</li><li>blue</li><!--for--><li>red</li><li>green</li><li>blue</li><!--for--></ol>' );
            expect( rendered ).toEqual( [
                're-loop-must-work-with-same-name-loops',
                'ReLoopMustWorkWithSameNameLoops_for00',
                'ReLoopMustWorkWithSameNameLoops_for01',
                'ReLoopMustWorkWithSameNameLoops_for0_for00',
                'ReLoopMustWorkWithSameNameLoops_for0_for01',
                'ReLoopMustWorkWithSameNameLoops_for0_for02',
                'ReLoopMustWorkWithSameNameLoops_for0_for03',
                'ReLoopMustWorkWithSameNameLoops_for0_for04',
                'ReLoopMustWorkWithSameNameLoops_for0_for05'
            ] );
        }
    } );

    it( 'loops with cond and outer scope', function() {
        const { view, rendered } = render( () => new ReLoopWithIfAndOuterScope( '#root', 're-loop-with-id-and-outer-scope' ) );
        view.update( {
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
        } );

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
            're-loop-with-id-and-outer-scope',
            'ReLoopWithIfAndOuterScope_for00',
            'ReLoopWithIfAndOuterScope_for01',
            'ReLoopWithIfAndOuterScope_for0_if00',
            'ReLoopWithIfAndOuterScope_for0_if01'
        ] );
    } );

} );
