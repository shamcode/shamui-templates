import { compile, renderWidget } from './helpers';

beforeEach( () => {
    window.LinkTo = compile`
        <a href={{url}}>
            {% defblock %}
        </a>
    `;
} );

afterEach( () => {
    delete window.LinkTo;
} );

it( 'should work with {% block "default" %}', async() => {
    expect.assertions( 1 );
    const { html } = await renderWidget(
        compile`
            <div>
                <LinkTo>
                    {% block 'default' %}
                        Text for content
                    {% endblock %}
                </LinkTo>
            </div>
        `,
        {}
    );
    expect( html ).toBe(
        '<div><a> Text for content <!--default--></a></div>'
    );
} );

it( 'should work with two named blocks', async() => {
    expect.assertions( 1 );
    window.CustomPanel = compile`
        <div>
            <div class="title">
                {% defblock 'title' %}
            </div>
            <div class="content">
                {% defblock %}
            </div>
        </div>
    `;
    const { html } = await renderWidget(
        compile`
            <div>
                <CustomPanel>
                    {% block 'title' %}
                        Text for title
                    {% endblock %}

                    {% block 'default' %}
                        Text for content
                    {% endblock %}
                </CustomPanel>
            </div>
        `,
        {}
    );
    expect( html ).toBe(
        // eslint-disable-next-line max-len
        '<div><div><div class="title"> Text for title <!--title--></div><div class="content"> Text for content <!--default--></div></div></div>'
    );
    delete window.CustomPanel;
} );

it( 'should work with widget arguments', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                <LinkTo url={{url}}>
                    {% block 'default' %}
                        Text for {{url}}
                    {% endblock %}
                </LinkTo>
            </div>
        `,
        {
            url: 'http://example.com'
        }
    );
    expect( html ).toBe(
        '<div><a href="http://example.com"> Text for http://example.com <!--default--></a></div>'
    );

    widget.update( {
        url: 'http://foo.example.com'
    } );
    expect( widget.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<div><a href="http://foo.example.com"> Text for http://foo.example.com <!--default--></a></div>'
    );
} );

it( 'should work with widget default block', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`
            <div>
                <LinkTo url={{url}}>
                    Text for {{url}}
                </LinkTo>
            </div>
        `,
        {
            url: 'http://example.com'
        }
    );
    expect( html ).toBe(
        '<div><a href="http://example.com"> Text for http://example.com<!--default--></a></div>'
    );

    widget.update( {
        url: 'http://foo.example.com'
    } );
    expect( widget.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<div><a href="http://foo.example.com"> Text for http://foo.example.com<!--default--></a></div>'
    );
} );
