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

it( 'should remove block in if', async() => {
    expect.assertions( 3 );
    window.VisibleBlock = compile`
        {% if visible %}
            <div class="content">
                {% defblock %}
            </div>
        {% endif %}
    `;
    const { html, widget } = await renderWidget(
        compile`
            <VisibleBlock visible={{visible}}>
                Text content for {{data}}
            </VisibleBlock>
        `,
        {
            visible: true,
            data: 'foo'
        }
    );
    expect( html ).toBe(
        '<div class="content"> Text content for foo<!--default--></div><!--if--><!--VisibleBlock-->'
    );

    widget.update( {
        visible: false,
        data: 'foz'
    } );
    expect( widget.container.innerHTML ).toBe( '<!--if--><!--VisibleBlock-->' );

    widget.update( {
        visible: true,
        data: 'foo'
    } );
    expect( widget.container.innerHTML ).toBe(
        '<div class="content"> Text content for foo<!--default--></div><!--if--><!--VisibleBlock-->'
    );
    delete window.VisibleBlock;
} );

it( 'should work with two nested if', async() => {
    expect.assertions( 3 );
    window.BigRedButton = compile`
        {% if big %}
            {% if red %} 
                <button class="big red">This button big={{big}}, red={{red}}{% defblock %}</button>
            {% endif %}
        {% endif %}
    `;
    const { html, widget } = await renderWidget(
        compile`
            <BigRedButton big={{big}} red={{red}}>
                big && red
            </BigRedButton>
        `,
        {
            big: false,
            red: false
        }
    );
    expect( html ).toBe( '<!--if--><!--BigRedButton-->' );

    widget.update( {
        big: true
    } );
    expect( widget.container.innerHTML ).toBe( '<!--if--><!--if--><!--BigRedButton-->' );

    widget.update( {
        red: true
    } );
    expect( widget.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<button class="big red">This button big=true, red=true big &amp;&amp; red <!--default--></button><!--if--><!--if--><!--BigRedButton-->'
    );
    delete window.BigRedButton;
} );

it( 'should work with defblock nested in useblock', async() => {
    expect.assertions( 4 );
    window.LoadedContainer = compile`
        {% if loaded %}
            {% defblock %}
        {% endif %}
    `;
    window.LoadedVisibleContainer = compile`
        <LoadedContainer loaded={{loaded}}>
            {% if visible %}
                {% defblock %}
            {% endif %}
        </LoadedContainer>
    `;
    window.RedLoadedVisibleContainer = compile`
        <LoadedVisibleContainer loaded={{loaded}} visible={{visible}}>
            {% if red %}
                {% defblock %}            
            {% endif %}
        </LoadedVisibleContainer>
    `;
    const { html, widget } = await renderWidget(
        compile`
            <RedLoadedVisibleContainer loaded={{loaded}} visible={{visible}} red={{red}}>
                red && loaded & visible
            </RedLoadedVisibleContainer>
        `,
        {
            red: false,
            loaded: false,
            visible: false
        }
    );
    expect( html ).toBe(
        // eslint-disable-next-line max-len
        '<!--if--><!--LoadedContainer--><!--LoadedVisibleContainer--><!--RedLoadedVisibleContainer-->'
    );

    widget.update( {
        loaded: true
    } );
    expect( widget.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<!--if--><!--default--><!--if--><!--LoadedContainer--><!--LoadedVisibleContainer--><!--RedLoadedVisibleContainer-->'
    );

    widget.update( {
        visible: true
    } );
    expect( widget.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<!--if--><!--default--><!--if--><!--default--><!--if--><!--LoadedContainer--><!--LoadedVisibleContainer--><!--RedLoadedVisibleContainer-->'
    );
    widget.update( {
        red: true
    } );
    expect( widget.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        ' red &amp;&amp; loaded &amp; visible <!--default--><!--if--><!--default--><!--if--><!--default--><!--if--><!--LoadedContainer--><!--LoadedVisibleContainer--><!--RedLoadedVisibleContainer-->'
    );
    delete window.LoadedContainer;
    delete window.LoadedVisibleContainer;
    delete window.RedLoadedVisibleContainer;
} );

it( 'should work with for', async() => {
    expect.assertions( 2 );
    const { html, widget } = await renderWidget(
        compile`
            <ul>
                {% for url of links %}
                    <li>
                        <LinkTo url={{url}}>Text for {{url}}</LinkTo>
                    </li>
                {% endfor %}
            </ul>
            <LinkTo url="http://example.com">Home</LinkTo>
        `,
        {
            links: [
                'http://foo.example.com',
                'http://bar.example.com',
                'http://baz.example.com'
            ]
        }
    );
    expect( html ).toBe(
        '<ul>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://foo.example.com">Text for http://foo.example.com<!--default--></a></li>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://bar.example.com">Text for http://bar.example.com<!--default--></a></li>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://baz.example.com">Text for http://baz.example.com<!--default--></a></li>' +
        '</ul>' +
        '<a href="http://example.com">Home<!--default--></a><!--LinkTo-->'
    );

    widget.update( {
        links: [
            'http://baz.example.com',
            'http://bar.example.com',
            'http://foo.example.com'
        ]
    } );
    expect( widget.container.innerHTML ).toBe(
        '<ul>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://baz.example.com">Text for http://baz.example.com<!--default--></a></li>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://bar.example.com">Text for http://bar.example.com<!--default--></a></li>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://foo.example.com">Text for http://foo.example.com<!--default--></a></li>' +
        '</ul>' +
        '<a href="http://example.com">Home<!--default--></a><!--LinkTo-->'
    );
} );
