import { compile, compileAsSFC, renderComponent } from './helpers';

beforeEach( () => {
    window.LinkTo = compile`
        <a href={{url}}>
            {% defblock %}
        </a>
    `;

    window.DisplayContent = compile`
        {% if condition %}
            {% defblock %}
        {% endif %}
    `;
} );

afterEach( () => {
    delete window.LinkTo;
    delete window.DisplayContent;
} );

it( 'should work with {% block "default" %}', () => {
    const { html } = renderComponent(
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

it( 'should work with two named blocks', () => {
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
    const { html } = renderComponent(
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

it( 'should work with component arguments', () => {
    const { html, component } = renderComponent(
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

    component.update( {
        url: 'http://foo.example.com'
    } );
    expect( component.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<div><a href="http://foo.example.com"> Text for http://foo.example.com <!--default--></a></div>'
    );
} );

it( 'should work with component default block', () => {
    const { html, component } = renderComponent(
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

    component.update( {
        url: 'http://foo.example.com'
    } );
    expect( component.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<div><a href="http://foo.example.com"> Text for http://foo.example.com<!--default--></a></div>'
    );
} );

it( 'should remove block in if', () => {
    window.VisibleBlock = compile`
        {% if visible %}
            <div class="content">
                {% defblock %}
            </div>
        {% endif %}
    `;
    const { html, component } = renderComponent(
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

    component.update( {
        visible: false,
        data: 'foz'
    } );
    expect( component.container.innerHTML ).toBe( '<!--if--><!--VisibleBlock-->' );

    component.update( {
        visible: true,
        data: 'foo'
    } );
    expect( component.container.innerHTML ).toBe(
        '<div class="content"> Text content for foo<!--default--></div><!--if--><!--VisibleBlock-->'
    );
    delete window.VisibleBlock;
} );

it( 'should work with two nested if', () => {
    window.BigRedButton = compile`
        {% if big %}
            {% if red %} 
                <button class="big red">This button big={{big}}, red={{red}}{% defblock %}</button>
            {% endif %}
        {% endif %}
    `;
    const { html, component } = renderComponent(
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

    component.update( {
        big: true
    } );
    expect( component.container.innerHTML ).toBe( '<!--if--><!--if--><!--BigRedButton-->' );

    component.update( {
        red: true
    } );
    expect( component.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<button class="big red">This button big=true, red=true big &amp;&amp; red <!--default--></button><!--if--><!--if--><!--BigRedButton-->'
    );
    delete window.BigRedButton;
} );

it( 'should work with defblock nested in useblock', () => {
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
    const { html, component } = renderComponent(
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

    component.update( {
        loaded: true
    } );
    expect( component.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<!--if--><!--default--><!--if--><!--LoadedContainer--><!--LoadedVisibleContainer--><!--RedLoadedVisibleContainer-->'
    );

    component.update( {
        visible: true
    } );
    expect( component.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<!--if--><!--default--><!--if--><!--default--><!--if--><!--LoadedContainer--><!--LoadedVisibleContainer--><!--RedLoadedVisibleContainer-->'
    );
    component.update( {
        red: true
    } );
    expect( component.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        ' red &amp;&amp; loaded &amp; visible <!--default--><!--if--><!--default--><!--if--><!--default--><!--if--><!--LoadedContainer--><!--LoadedVisibleContainer--><!--RedLoadedVisibleContainer-->'
    );
    delete window.LoadedContainer;
    delete window.LoadedVisibleContainer;
    delete window.RedLoadedVisibleContainer;
} );

it( 'should work with for', () => {
    const { html, component } = renderComponent(
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

    component.update( {
        links: [
            'http://baz.example.com',
            'http://bar.example.com',
            'http://foo.example.com'
        ]
    } );
    expect( component.container.innerHTML ).toBe(
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

it( 'should work useblock if was update from block component', () => {
    const { component } = renderComponent(
        compile`
            <DisplayContent>
                Content
            </DisplayContent>
        `,
        {

        }
    );
    expect( component.container.textContent.trim() ).toBe( '' );

    const displayContent = component.UI.find( x => x instanceof window.DisplayContent );
    displayContent.update( { condition: true } );
    expect( component.container.textContent.trim() ).toBe( 'Content' );

    displayContent.update( { condition: false } );
    expect( component.container.textContent.trim() ).toBe( '' );
} );


it( 'should correct resolve owner', () => {
    const { component } = renderComponent(
        compileAsSFC`
            <template>
                <LinkTo>
                    <LinkTo>
                        {{this._text()}}
                    </LinkTo>
                </LinkTo>
            </template>
            
            <script>
                import { options } from 'sham-ui';
                class dummy extends Template {
                    @options text() {
                        return 'Text for content'
                    }
                    
                    _text() {
                        return this.options.text();
                    }
                }
            </script>
        `
    );
    expect( component.container.textContent.trim() ).toBe( 'Text for content' );
} );


