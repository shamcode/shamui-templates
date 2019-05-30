import { compileAsSFC, renderComponent, compile } from './helpers';

it( 'should single file component work', async() => {
    expect.assertions( 2 );
    const { component, html } = await renderComponent(
        compileAsSFC`
        <template>
            {% if loaded %}
                Loaded!
            {% endif %}
        </template>
        
        <script>
            class dummy extends Template {
                
            }
        </script>
        `,
        {
            loaded: false
        }
    );
    expect( html ).toBe( '<!--if-->' );
    component.update( { loaded: true } );
    expect( component.container.innerHTML ).toBe( ' Loaded! <!--if-->' );
} );

it( 'should single file component correct work with options', async() => {
    expect.assertions( 2 );
    const { component, html } = await renderComponent(
        compileAsSFC`
        <template>
            {% if loaded %}
                {{text}}
            {% endif %}
        </template>
        
        <script>
            import { options } from 'sham-ui';
            class dummy extends Template {
                @options get text() {
                    return 'Text for content'
                }
            }
        </script>
        `,
        {
            loaded: false
        }
    );
    expect( html ).toBe( '<!--if-->' );
    component.update( { loaded: true } );
    expect( component.container.innerHTML ).toBe( 'Text for content<!--if-->' );
} );

it( 'should single file component correct work with imports', async() => {
    expect.assertions( 1 );
    const { html } = await renderComponent(
        compileAsSFC`
        <template>
            {% import upperCase from 'upper-case' %}

            <section>
                {{ upperCase(text) | upperCase }}
            </section>
        </template>
        
        <script>
            import { options } from 'sham-ui';
            class dummy extends Template {
                @options text = 'default text';
            }
        </script>
        `,
        {
            text: 'upper'
        }
    );
    expect( html ).toBe( '<section>UPPER</section>' );
} );


it( 'should single file component correct work with context in blocks', async() => {
    expect.assertions( 1 );
    window.CustomPanel = compile`
        <div>
            <div class="title">
                {% defblock 'title' %}
            </div>
        </div>
    `;
    const { html } = await renderComponent(
        compileAsSFC`
        <template>
            <CustomPanel>
                {% block 'title' %}
                    {{this.title()}}
                {% endblock %}
            </CustomPanel>
        </template>
        
        <script>
            class dummy extends Template {
                title() {
                    return 'Title text'
                };
            }
        </script>
        `
    );
    expect( html ).toBe(
        '<div><div class="title"> Title text <!--title--></div></div><!--CustomPanel-->'
    );

    delete window.CustomPanel;
} );
