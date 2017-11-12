describe( 'If tags', function() {
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

    it( 'should properly work', function() {
        {
            const { view, rendered } = render( () => new CondIf( '#root', 'cond-if' ) );
            view.update( { test: true, context: 'parent data' } );
            expect( view ).toBeLike( '<div>true: parent data</div>' );
            expect( rendered ).toEqual( [
                'cond-if',
                'CondIf_if00'
            ] );
            view.update( { test: false } );
            expect( view ).toBeLike( '<div></div>' );
            expect( rendered ).toEqual( [
                'cond-if',
                'CondIf_if00'
            ] );

            view.update( { test: true } );
            expect( view ).toBeLike( '<div>true: parent data</div>' );
            expect( rendered ).toEqual( [
                'cond-if',
                'CondIf_if00',
                'CondIf_if01'
            ] );
        }
        {
            const { view, rendered } = render( () => new CondElse( '#root', 'cond-else' ) );
            view.update( { test: true } );
            expect( view ).toBeLike( '<div> then </div>' );

            view.update( { test: false } );
            expect( view ).toBeLike( '<div> else </div>' );
            expect( rendered ).toEqual( [
                'cond-else',
                'CondElse_if00',
                'CondElse_else10'
            ] );
        }
    } );

    it( 'should work with expression', function() {
        const { view, rendered } = render( () => new CondExpr( '#root', 'cond-expr' ) );
        expect( rendered ).toEqual( [
            'cond-expr'
        ] );
        view.update( {
            array: [ 1, 2, 3, 4, 5 ],
            look: 3,
            indep: 'independent'
        } );
        expect( view ).toBe( '<div> (one) <!--if-->3<p>independent</p><!--if--></div>' );
        expect( rendered ).toEqual( [
            'cond-expr',
            'CondExpr_if00',
            'CondExpr_if20'
        ] );

        view.update( { look: 2 } );
        expect( view ).toBe( '<div> (one) <!--if-->2<p>independent</p><!--if--></div>' );
        expect( rendered ).toEqual( [
            'cond-expr',
            'CondExpr_if00',
            'CondExpr_if20'
        ] );
    } );

    it( 'should update only one view', function() {
        const { view, rendered } = render( () => new CondUpdate( '#root', 'cond-update' ) );
        view.update( {
            test: true,
            value: 'old'
        } );
        expect( view ).toBe( '<div>old</div>' );
        expect( rendered ).toEqual( [
            'cond-update',
            'CondUpdate_if00'
        ] );

        view.update( { test: false, value: 'new' } );
        expect( view ).toBe( '<div></div>' );
        expect( rendered ).toEqual( [
            'cond-update',
            'CondUpdate_if00'
        ] );

        view.update( { test: true } );
        expect( view ).toBe( '<div>new</div>' );

        view.update( { test: true, value: 'new' } );
        expect( view ).toBe( '<div>new</div>' );
        expect( rendered ).toEqual( [
            'cond-update',
            'CondUpdate_if00',
            'CondUpdate_if01'
        ] );
    } );

} );