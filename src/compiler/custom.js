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
            figure.declare( sourceNode( `const ${placeholder} = document.createComment( '${node.name}' );` ) );
        }

        figure.thisRef = true;
        figure.declare( sourceNode( `const ${childName} = {};` ) );

        let data = [];
        let variables = [];

        // Collect info about variables and attributes.
        for ( let attr of node.attributes ) {
            if ( attr.type === 'SpreadAttribute' ) {
                let [ expr ] = compileToExpression( figure, attr, compile );
                const variables = collectVariables( figure.getScope(), expr );
                let spreadSN = sourceNode( node.loc,
                    `            __UI__.insert( _this, ${placeholder}, ${childName}, ${templateName}, ${compile( expr )}, ${figure.getPathToDocument()} )`
                );
                if ( variables.length > 0 ) {
                    figure.spot( variables ).add( spreadSN );
                } else {
                    figure.addOnUpdate( spreadSN );
                }
            } else {

                let [ expr ] = compileToExpression( figure, attr, compile ); // TODO: Add support for default value in custom tag attributes attr={{ value || 'default' }}.
                variables = variables.concat( collectVariables( figure.getScope(), expr ) );

                let property = sourceNode( node.loc, [ `'${attr.name}': ${compile( expr )}` ] );
                data.push( property );

            }
        }

        variables = unique( variables );
        data = `{${data.join( ', ' )}}`;


        let blockCode = `__UI__.insert( _this, ${placeholder}, ${childName}, ${templateName}, ${data}, ${figure.getPathToDocument()} )`;

        // Add spot for custom attribute or insert on render if no variables in attributes.
        if ( variables.length > 0 ) {
            const spot = figure.spot( variables );
            node.addBlockMethod = spot.add.bind( spot );
            blockCode = `                ${blockCode}`;
        } else {
            node.addBlockMethod = figure.addRenderActions.bind( figure );
            blockCode = `            ${blockCode}`;
        }
        node.addBlockMethod(
            sourceNode( node.loc, blockCode )
        );

        if ( node.body.length > 0 ) {
            node.childName = `${childName}.ref`;
            node.pathToDocument = figure.getPathToDocument();
            figure.children = node.body
                .map( ( child ) => compile( child, figure ) )
                .filter( notNull );
            delete node.childName;
            delete node.pathToDocument;
        }

        delete node.addBlockMethod;

        return node.reference;
    }
};
