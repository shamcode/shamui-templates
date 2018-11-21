import { compile, renderWidget } from './helpers';

it( 'should properly work', async()=>  {
    expect.assertions( 5 );
    {
        const { html, widget } = await renderWidget(
            compile`
                <div>
                    {% if test %}true: {{ context }}{% endif %}
                </div>
            `
            ,
            {
                test: true,
                context: 'parent data'
            }
        );
        expect( html ).toBe( '<div>true: parent data</div>' );
        widget.update( { test: false } );
        expect( widget.container.innerHTML ).toBe( '<div></div>' );

        widget.update( { test: true } );
        expect( widget.container.innerHTML ).toBe( '<div>true: parent data</div>' );
    }
    {
        const { html, widget } = await renderWidget(
            compile`
                <div>
                    {% if test %}
                        then
                    {% else %}
                        else
                    {% endif %}
                </div>
            `,
            {
                test: true
            }
        );
        expect( html ).toBe( '<div> then </div>' );
        widget.update( { test: false } );
        expect( widget.container.innerHTML ).toBe( '<div> else </div>' );
    }
} );

it( 'should work with expression', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`
            <div>    
                {% if array.indexOf(1) != -1 %}
                    (one)
                {% endif %}
                {% if array.indexOf(look) != -1 %}
                    {{ look }}
                    <p>{{ indep }}</p>
                {% endif %}
            </div>
        `,
        {
            array: [ 1, 2, 3, 4, 5 ],
            look: 3,
            indep: 'independent'
        }
    );
    expect( html ).toBe( '<div> (one) <!--if-->3<p>independent</p><!--if--></div>' );
    widget.update( { look: 2 } );
    expect( widget.container.innerHTML ).toBe(
        '<div> (one) <!--if-->2<p>independent</p><!--if--></div>'
    );
} );

it( 'should update only one view', async() => {
    expect.assertions( 4 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                {% if test %}
                    {{ value }}
                {% endif %}
            </div>
        `
        ,
        {
            test: true,
            value: 'old'
        }
    );
    expect( html ).toBe( '<div>old</div>' );
    widget.update( { test: false, value: 'new' } );
    expect( widget.container.innerHTML ).toBe( '<div></div>' );

    widget.update( { test: true } );
    expect( widget.container.innerHTML ).toBe( '<div>new</div>' );

    widget.update( { test: true, value: 'new' } );
    expect( widget.container.innerHTML ).toBe( '<div>new</div>' );
} );
