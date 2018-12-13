import { DI } from 'sham-ui';
import { compile, renderWidget } from './helpers';

it( 'should insert constants as HTML', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
            <div>
                {% unsafe "<br>" %}
            </div>
        `
    );
    expect( html ).toBe( '<div><br></div>' );
} );


it( 'should insert variables as HTML', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                {% unsafe html %}
            </div>
        `
    );
    expect( html ).toBe( '<div></div>' );

    widget.update( { html: '<a href="javascript:XSS;">Link</a>' } );
    expect( widget.container.innerHTML ).toBe( '<div><a href="javascript:XSS;">Link</a></div>' );
} );

it( 'should remove old DOM nodes and insert new', async() => {
    expect.assertions( 4 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                {% unsafe html %}
            </div>
        `,
        {
            html: '<div>foo</div><br>'
        }
    );
    expect( html ).toBe( '<div><div>foo</div><br></div>' );

    widget.update( { html: '<input type="datetime"><hr><div>baz</div>' } );
    expect( widget.container.innerHTML ).toBe(
        '<div><input type="datetime"><hr><div>baz</div></div>'
    );

    widget.update( { html: '' } );
    expect( widget.container.innerHTML ).toBe( '<div></div>' );

    widget.update( { html: '<!-- comment -->' } );
    expect( widget.container.innerHTML ).toBe( '<div><!-- comment --></div>' );
} );

it( 'should insert unsafe with placeholders', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                {% unsafe "<br>" %}
                {% unsafe html %}
            </div>
        `,
        {
            html: '<hr>'
        }
    );
    expect( html ).toBe( '<div><br><!--unsafe--><hr><!--unsafe--></div>' );

    widget.update( { html: '<br><!-- comment --><link href="http://ShamUIView.js.org">' } );
    expect( widget.container.innerHTML ).toBe(

        // eslint-disable-next-line max-len
        '<div><br><!--unsafe--><br><!-- comment --><link href="http://ShamUIView.js.org"><!--unsafe--></div>'
    );
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
