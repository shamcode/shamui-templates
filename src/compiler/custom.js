import { sourceNode } from './sourceNode';
import { collectVariables } from './variable';
import { isSingleChild, unique, notNull, getTemplateName } from '../utils';
import { compileToExpression } from './attribute';

export default {
    Element: ( { parent, node, figure, compile } ) => {
        node.reference = null;

        let templateName = getTemplateName( node.name );
        let childName = 'child' + figure.uniqid( 'child_name' );
        let placeholder;

        if ( isSingleChild( parent, node ) ) {
            placeholder = parent.reference;
        } else {
            node.reference = placeholder = 'custom' + figure.uniqid( 'placeholder' );
            figure.declare( sourceNode( `var ${placeholder} = document.createComment('${node.name}');` ) );
        }

        figure.declare( sourceNode( `var ${childName} = {};` ) );

        let data = [];
        let variables = [];

        // Collect info about variables and attributes.
        for ( let attr of node.attributes ) {
            if ( attr.type === 'SpreadAttribute' ) {

                figure.spot( attr.identifier.name ).add(
                    sourceNode( node.loc,
                        `      __UI__.insert(_this, ${placeholder}, ${childName}, ${templateName}, ${attr.identifier.name})`
                    )
                );

            } else {

                let [ expr ] = compileToExpression( figure, attr, compile ); // TODO: Add support for default value in custom tag attributes attr={{ value || 'default' }}.
                variables = variables.concat( collectVariables( figure.getScope(), expr ) );

                let property = sourceNode( node.loc, [ `'${attr.name}': ${compile( expr )}` ] );
                data.push( property );

            }
        }

        variables = unique( variables );
        data = `{${data.join( ', ' )}}`;

        figure.thisRef = true;

        // Add spot for custom attribute or insert on render if no variables in attributes.
        if ( variables.length > 0 ) {
            const spot = figure.spot( variables );
            node.addBlockMethod = spot.add.bind( spot );
        } else {
            node.addBlockMethod = figure.addRenderActions.bind( figure );
        }

        node.addBlockMethod(
            sourceNode( node.loc,
                `      __UI__.insert(_this, ${placeholder}, ${childName}, ${templateName}, ${data})`
            )
        );

        if ( node.body.length > 0 ) {
            node.childName = `${childName}.ref`;
            figure.children = node.body
                .map( ( child ) => compile( child, figure ) )
                .filter( notNull );
            delete node.childName;
        }

        delete node.addBlockMethod;

        return node.reference;
    }
};
