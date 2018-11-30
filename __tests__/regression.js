import { DI } from 'sham-ui';
import { compile, renderWidget } from './helpers';

afterEach( () => {
    DI.bind( 'logger', console );
} );

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

it( 'should update variables in nested views', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`
            <p>
                {% for i of each %}
                    {% if on %}
                        {{ value }}
                    {% endif %}
                {% endfor %}
            </p>
        `,
        {
            value: 1,
            on: true,
            each: [ 1, 2, 3 ]
        }
    );
    expect( html ).toBe( '<p>1<!--if-->1<!--if-->1<!--if--></p>' );

    widget.update( { value: 7 } );
    expect( widget.container.innerHTML ).toBe( '<p>7<!--if-->7<!--if-->7<!--if--></p>' );
} );

it( 'should work with first level non-elements', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
            text
            {% if cond %}
                <div class="if">ok</div>
            {% endif %}
            {% for loop %}
                <div class="for">ok</div>
            {% endfor %}
            <first-level-tag on="{{ tag }}">
                <div class="custom">ok</div>
            </first-level-tag>
            {% unsafe "<i class='unsafe'>" + xss + "</i>" %}
        `,
        {
            cond: true,
            loop: [ 1, 2, 3 ],
            tag: true,
            xss: 'ok'
        }
    );
    expect( html ).toBe(
        //eslint-disable-next-line max-len
        'text <div class="if">ok</div><!--if--><div class="for">ok</div><div class="for">ok</div><div class="for">ok</div><!--for--><div class="custom">ok</div><!--first-level-tag--><i class="unsafe">ok</i><!--unsafe-->'
    );
} );

//eslint-disable-next-line max-len
it( 'should throw exception if user try to use querySelector on first level non-elements', async() => {
    expect.assertions( 3 );
    const loggerMock = {
        error: jest.fn()
    };
    DI.bind( 'logger', loggerMock );

    const { widget } = await renderWidget(
        compile`
            text
            {% if cond %}
                <div class="if">ok</div>
            {% endif %}
            {% for loop %}
                <div class="for">ok</div>
            {% endfor %}
            <first-level-tag on="{{ tag }}">
                <div class="custom">ok</div>
            </first-level-tag>
            {% unsafe "<i class='unsafe'>" + xss + "</i>" %}
        `,
        {
            cond: true,
            loop: [ 1, 2, 3 ],
            tag: true,
            xss: 'ok'
        }
    );
    widget.querySelector( '.if' );

    expect( loggerMock.error.mock.calls ).toHaveLength( 4 );
    expect( loggerMock.error.mock.calls[ 0 ] ).toHaveLength( 2 );
    expect( loggerMock.error.mock.calls[ 0 ][ 0 ].message ).toBe(
        'sham-ui: Can not use querySelector with non-element nodes on first level.'
    );
} );
