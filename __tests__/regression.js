import { DI } from 'sham-ui';
import { compile, renderWidget } from './helpers';

beforeEach( () => {
    window.Tag = compile`
        <div> Custom tag </div>
    `;
    window[ 'custom_tag_with_loop' ] = compile`
        <em>
            {% for item of list %}
                <b class="{{ foo }}{{ bar }}">{{ item }}</b>
            {% endfor %}
        </em>
    `;
} );
afterEach( () => {
    DI.bind( 'logger', console );
    delete window.Tag;
    delete window[ 'custom_tag_with_loop' ];
} );

afterAll( () => {
    document.body.innerHTML = '';
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

it( 'if with custom tag', async() => {
    expect.assertions( 3 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                {% if test %}
                    <Tag/>
                {% endif %}
            </div>
        `,
        {
            test: true
        }
    );
    expect( html ).toBe( '<div><div> Custom tag </div><!--Tag--></div>' );

    widget.update( { test: false } );
    expect( widget.container.innerHTML ).toBe( '<div></div>' );

    widget.update( { test: true } );
    expect( widget.container.innerHTML ).toBe( '<div><div> Custom tag </div><!--Tag--></div>' );
} );

it( 'if with unsafe tag', async() => {
    expect.assertions( 3 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                {% if test %}
                    <div>
                        {% unsafe "<i>unsafe</i>" %}
                    </div>
                {% endif %}
            </div>
        `,
        {
            test: true
        }
    );
    expect( html ).toBe( '<div><div><i>unsafe</i></div></div>' );

    widget.update( { test: false } );
    expect( widget.container.innerHTML ).toBe( '<div></div>' );

    widget.update( { test: true } );
    expect( widget.container.innerHTML ).toBe( '<div><div><i>unsafe</i></div></div>' );
} );

it( 'for with custom tag', async() => {
    expect.assertions( 3 );
    const { widget, html } = await renderWidget(
        compile`
            <div>
                {% for array %}
                    <Tag/>
                {% endfor %}
            </div>
        `,
        {
            array: [ 1, 2, 3 ]
        }
    );
    expect( html ).toBe(
        //eslint-disable-next-line max-len
        '<div><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--></div>'
    );

    widget.update( { array: [] } );
    expect( widget.container.innerHTML ).toBe( '<div></div>' );

    widget.update( { array: [ 1, 3 ] } );
    expect( widget.container.innerHTML ).toBe(
        '<div><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--></div>'
    );
} );

it( 'update loops in custom tags', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
            <i>
                <custom-tag-with-loop list={{ list }} foo={{ foo }} bar={{ bar }}/>
            </i>
        `,
        {
            foo: 'foo',
            bar: 'bar',
            list: [ 1, 2, 3 ]
        }
    );
    expect( html ).toBe(
        '<i><em><b class="foobar">1</b><b class="foobar">2</b><b class="foobar">3</b></em></i>'
    );
} );

it( 'should not update variables what exists only in inner scope', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
            <p>
                {% if list %}
                    {% for t1 of list %}
                        {% for value of t1 %}
                            <i>{{ value }}</i>
                        {% endfor %}
                    {% endfor %}
                {% endif %}
            </p>
        `,
        {
            list: [ [ 1 ], [ 2 ], [ 3 ] ],
            t1: 'bug?'
        }
    );

    expect( html ).toBe(
        '<p><i>1</i><!--for--><i>2</i><!--for--><i>3</i><!--for--><!--for--></p>'
    );
} );

it( 'should cache options variable data for loops', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`
            <ul>
                {% for code, item of currencies %}
                    {% if code == currency %}
                        <li class="selected">
                            <span>{{ code }}</span>{{ ': ' + item.name }}
                        </li>
                    {% else %}
                        <li>
                            <span>{{ code }}</span>{{ ': ' + item.name }}
                        </li>
                    {% endif %}
                {% endfor %}
            </ul>
        `,
        {
            'currency': 'USD',
            'locale': 'en',
            'currencies': {
                'USD': { 'name': 'US dollar' },
                'EUR': { 'name': 'Euro' },
                'AUD': { 'name': 'Australian dollar' }
            }
        }
    );

    expect( html ).toBe(
        //eslint-disable-next-line max-len
        '<ul><li class="selected"><span>USD</span>: US dollar</li><!--if--><li><span>EUR</span>: Euro</li><!--if--><li><span>AUD</span>: Australian dollar</li><!--if--></ul>'
    );

    const data2 = {
        'currency': 'AUD',
        'locale': 'en',
        'currencies': {
            'USD': { 'name': 'US dollar' },
            'EUR': { 'name': 'Euro' },
            'AUD': { 'name': 'Australian dollar' }
        }
    };

    widget.update( data2 );
    expect( widget.container.innerHTML ).toBe(
        //eslint-disable-next-line max-len
        '<ul><li><span>USD</span>: US dollar</li><!--if--><li><span>EUR</span>: Euro</li><!--if--><li class="selected"><span>AUD</span>: Australian dollar</li><!--if--></ul>'
    );
} );

it( 'loos should update two levels loops once', async() => {
    expect.assertions( 2 );
    const data = {
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

    const ReLoopMustNotMutateData = await renderWidget(
        compile`
            <ol>
                {% for sub of colors %}
                    {% for color of sub.colors %}
                        <li>
                            {{ color.color }}
                        </li>
                    {% endfor %}
                {% endfor %}
            </ol>
        `,
        data
    );
    expect( ReLoopMustNotMutateData.html ).toBe(
        //eslint-disable-next-line max-len
        '<ol><li>red</li><li>green</li><li>blue</li><!--for--><li>red</li><li>green</li><li>blue</li><!--for--></ol>'
    );

    const ReLoopMustWorkWithSameNameLoops = await renderWidget(
        compile`
            <ol>
                {% for colors %}
                    {% for colors %}
                        <li>
                            {{ color }}
                        </li>
                    {% endfor %}
                {% endfor %}
            </ol>
        `,
        data
    );
    expect( ReLoopMustWorkWithSameNameLoops.html ).toBe(
        //eslint-disable-next-line max-len
        '<ol><li>red</li><li>green</li><li>blue</li><!--for--><li>red</li><li>green</li><li>blue</li><!--for--></ol>'
    );
} );

it( 'loops with cond and outer scope', async() => {
    expect.assertions( 2 );
    const { widget, html } = await renderWidget(
        compile`
            <div>
                {% for attr of attributes %}
                    <span>{{attr.name}}</span>
                    <span>{{attr.value}}</span>
                    {% if attr %}
                        <span>{{outer}}</span>
                    {% endif %}
                {% endfor %}
            </div>
        `,
        {
            outer: 'outer',
            attributes: [
                {
                    name: 'name1',
                    value: 'value1'
                },
                {
                    name: 'name2',
                    value: 'value2'
                }
            ]
        }
    );
    expect( html ).toBe(
        //eslint-disable-next-line max-len
        '<div><span>name1</span><span>value1</span><span>outer</span><!--if--><span>name2</span><span>value2</span><span>outer</span><!--if--></div>'
    );
    widget.update( {
        outer: 'outer2'
    } );
    expect( widget.container.innerHTML ).toBe(
        //eslint-disable-next-line max-len
        '<div><span>name1</span><span>value1</span><span>outer2</span><!--if--><span>name2</span><span>value2</span><span>outer2</span><!--if--></div>'
    );
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
