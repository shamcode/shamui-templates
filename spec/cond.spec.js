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

    it( 'should properly work', function() {
        {
            const { view, rendered } = render( () => new CondIf( '#root', 'cond-if', {
                test: true,
                context: 'parent data'
            } ) );
            expect( view ).toBeLike( '<div>true: parent data</div>' );
            expect( rendered ).toEqual( [
                'CondIf_if0',
                'cond-if'
            ] );
            view.update( { test: false } );
            expect( view ).toBeLike( '<div></div>' );
            expect( rendered ).toEqual( [
                'CondIf_if0',
                'cond-if'
            ] );

            view.update( { test: true } );
            expect( view ).toBeLike( '<div>true: parent data</div>' );
            expect( rendered ).toEqual( [
                'CondIf_if0',
                'cond-if',
                'CondIf_if0'
            ] );
        }
        {
            const { view, rendered } = render( () => new CondElse( '#root', 'cond-else', {
                test: true
            } ) );
            expect( view ).toBeLike( '<div> then </div>' );

            view.update( { test: false } );
            expect( view ).toBeLike( '<div> else </div>' );
            expect( rendered ).toEqual( [
                'CondElse_if0',
                'cond-else',
                'CondElse_else1'
            ] );
        }
    } );

    it( 'should work with expression', function() {
        const { view, rendered } = render( () => new CondExpr( '#root', 'cond-expr', {
            array: [ 1, 2, 3, 4, 5 ],
            look: 3,
            indep: 'independent'
        } ) );
        expect( view ).toBe( '<div> (one) <!--if-->3<p>independent</p><!--if--></div>' );
        expect( rendered ).toEqual( [
            'CondExpr_if0',
            'CondExpr_if2',
            'cond-expr'
        ] );

        view.update( { look: 2 } );
        expect( view ).toBe( '<div> (one) <!--if-->2<p>independent</p><!--if--></div>' );
        expect( rendered ).toEqual( [
            'CondExpr_if0',
            'CondExpr_if2',
            'cond-expr'
        ] );
    } );

    it( 'should update only one view', function() {
        const { view, rendered } = render( () => new CondUpdate( '#root', 'cond-update', {
            test: true,
            value: 'old'
        } ) );
        expect( view ).toBe( '<div>old</div>' );
        expect( rendered ).toEqual( [
            'CondUpdate_if0',
            'cond-update'
        ] );

        view.update( { test: false, value: 'new' } );
        expect( view ).toBe( '<div></div>' );
        expect( rendered ).toEqual( [
            'CondUpdate_if0',
            'cond-update'
        ] );

        view.update( { test: true } );
        expect( view ).toBe( '<div>new</div>' );

        view.update( { test: true, value: 'new' } );
        expect( view ).toBe( '<div>new</div>' );
        expect( rendered ).toEqual( [
            'CondUpdate_if0',
            'cond-update',
            'CondUpdate_if0'
        ] );
    } );

} );