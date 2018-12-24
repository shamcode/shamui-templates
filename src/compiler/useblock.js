import { sourceNode } from './sourceNode';
import { Figure } from '../figure';
import { notNull, getStringLiteralValue, getTemplateName } from '../utils';

export default {
    UseBlockStatement: ( { node, parent, figure, compile } ) => {
        node.reference = null;

        if ( !parent || 'Element' !== parent.type ) {
            throw new Error( 'Usage {% block %} only with custom Widget' );
        }

        const parentName = getTemplateName( parent.name );
        const blockName = getStringLiteralValue( node.name );
        const templateNameForBlock = `${figure.name}_${parentName}_block_${blockName}_${figure.uniqid( 'template_name' )}`;
        const childNameForBlock = 'child' + figure.uniqid( 'child_name' );
        figure.declare( `var ${childNameForBlock} = {};` );

        let compileBody = ( loc, body, templateName, childName ) => {
            let subfigure = new Figure( templateName, figure );
            subfigure.children = body.map( node => compile( node, subfigure ) ).filter( notNull );
            figure.addFigure( subfigure );

            figure.addOnUpdate(
                sourceNode( loc, [
                    `    if (${childName}.ref) {\n`,
                    `      ${childName}.ref.update(__data__);\n`,
                    '    }'
                ] )
            );
        };

        compileBody( node.loc, node.body, templateNameForBlock, childNameForBlock );

        parent.addBlockMethod(
            sourceNode( node.loc,
                `      __UI__.insert(${parent.childName}, ${parent.childName}.blocks['${blockName}'], ${childNameForBlock}, ${templateNameForBlock}, {});`
            )
        );

        return node.reference;
    }
};
