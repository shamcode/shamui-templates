import { compile, renderWidget } from './helpers';

it( 'should update all values', async() => {
    expect.assertions( 6 );
    const RegressionParentValues = await renderWidget(
        compile`
            <p>{{ value }}</p>
            <p>{% if on %}{{ value }}{% endif %}</p>
            <p>{% for i of each %}{{ value }}{% endfor %}</p>
        `,
        {
            value: 1,
            on: true,
            each: [ 1, 2, 3 ]
        }
    );
    expect( RegressionParentValues.html ).toBe( '<p>1</p><p>1</p><p>111</p>' );

    RegressionParentValues.widget.update( { value: 2 } );
    expect( RegressionParentValues.widget.container.innerHTML ).toBe(
        '<p>2</p><p>2</p><p>222</p>'
    );

    const RegressionParentValuesComplex = await renderWidget(
        compile`
            <p>{{ a + b }}</p>
            <p>{% if on %}{{ a - b }}{% endif %}</p>
            <p>{% for i of each %}{{ a * b }}{% endfor %}</p>
        `,
        {
            a: 2,
            b: 3,
            on: true,
            each: [ 1, 2 ]
        }
    );
    expect( RegressionParentValuesComplex.html ).toBe( '<p>5</p><p>-1</p><p>66</p>' );

    RegressionParentValuesComplex.widget.update( { a: 4 } );
    expect( RegressionParentValuesComplex.widget.container.innerHTML ).toBe(
        '<p>7</p><p>1</p><p>1212</p>'
    );

    RegressionParentValuesComplex.widget.update( { b: 1 } );
    expect( RegressionParentValuesComplex.widget.container.innerHTML ).toBe(
        '<p>5</p><p>3</p><p>44</p>'
    );

    RegressionParentValuesComplex.widget.update( { a: 2, b: 2 } );
    expect( RegressionParentValuesComplex.widget.container.innerHTML ).toBe(
        '<p>4</p><p>0</p><p>44</p>'
    );
} );
