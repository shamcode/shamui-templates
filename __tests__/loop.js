import { compile, renderWidget } from './helpers';

beforeEach( () => {
    window.MyLi = compile`
        <li>{{ props.id + ':' + props.value }}</li>
    `;
    window.MyUl = compile`
        <ul>
            {% for element of list %}
                <MyLi props="{{ element }}"/>
            {% endfor %}
        </ul>
    `;
} );

afterEach( () => {
    delete window.MyLi;
    delete window.MyUl;
} );


it( 'should render arrays', async() => {
    expect.assertions( 3 );
    const { html, widget } = await renderWidget(
        compile`
            <ul>
                {% for key, value of list %}
                    <li>{{ key }}:{{ value }}</li>
                {% endfor %}
            </ul>
        `,
        {
            list: [ 1, 2, 3 ]
        }
    );
    expect( html ).toBe( '<ul><li>0:1</li><li>1:2</li><li>2:3</li></ul>' );

    widget.update( { list: [ 1, 3 ] } );
    expect( widget.container.innerHTML ).toBe( '<ul><li>0:1</li><li>1:3</li></ul>' );

    widget.update( { list: [ 'a', 'b', 'c', 'd' ] } );
    expect( widget.container.innerHTML ).toBe(
        '<ul><li>0:a</li><li>1:b</li><li>2:c</li><li>3:d</li></ul>'
    );
} );

it( 'should render arrays with externals', async() =>{
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
            <div>
                {% for value of list %}
                    <p>{{ value }}{{ ext }}</p>
                {% endfor %}
            </div>
        `,
        {
            list: [ 1, 2, 3 ],
            ext: '.js'
        }
    );
    expect( html ).toBe( '<div><p>1.js</p><p>2.js</p><p>3.js</p></div>' );
} );

it( 'should iterate over objects', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                {% for key, value of obj %}
                    {{ key }}: {{ value }};
                {% endfor %}
            </div>
        `,
        {
            obj: {
                a: 1,
                b: 2,
                c: 3
            }
        }
    );
    expect( html ).toBe( '<div>a: 1; b: 2; c: 3; </div>' );

    widget.update( {
        obj: {
            a: 1,
            c: 3,
            d: 4
        }
    } );
    expect( widget.container.innerHTML ).toBe( '<div>a: 1; c: 3; d: 4; </div>' );
} );

it( 'should iterate over arrays without options', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
            <div>
                {% for obj %}
                    {{ name }};
                {% endfor %}
            </div>
        `,
        {
            obj: [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]
        }
    );
    expect( html ).toBe( '<div>a; b; c; </div>' );
} );

it( 'should delete old items from childred map with custom tag', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                <MyUl list="{{ list }}"/>
            </div>
        `,
        {
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
        }
    );
    expect( html ).toBe(
        '<div><ul><li>1:a</li><!--MyLi--><li>2:b</li><!--MyLi--><li>3:c</li><!--MyLi--></ul></div>'
    );

    widget.update( {
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
    expect( widget.container.innerHTML ).toBe(
        '<div><ul><li>1:a</li><!--MyLi--><li>3:c</li><!--MyLi--></ul></div>'
    );
} );

it( 'should not expose local variables', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
            <section>
                {% for a of as %}
                    <i>
                        {% for b of bs %}
                            <b>{{ b }}</b>
                        {% endfor %}
                    </i>
                {% endfor %}
            </section>
        `,
        {
            as: [ 'a', 'b' ],
            bs: [ 1, 2 ],
            b: 'GLOBAL'
        }
    );
    expect( html ).toBe(
        '<section><i><b>1</b><b>2</b></i><i><b>1</b><b>2</b></i></section>'
    );
} );
