import { compileAsSFW, renderWidget } from './helpers';

it( 'should single file widget work', async() => {
    expect.assertions( 2 );
    const { widget, html } = await renderWidget(
        compileAsSFW`
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
    widget.update( { loaded: true } );
    expect( widget.container.innerHTML ).toBe( ' Loaded! <!--if-->' );
} );

it( 'should single file widget correct work with options', async() => {
    expect.assertions( 2 );
    const { widget, html } = await renderWidget(
        compileAsSFW`
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
    widget.update( { loaded: true } );
    expect( widget.container.innerHTML ).toBe( 'Text for content<!--if-->' );
} );
