import { sourceNode } from './sourceNode';
import { Figure } from '../figure';
import { notNull, getStringLiteralValue, getTemplateName } from '../utils';

export default {
    UseBlockStatement: ( { node, parent, figure, compile } ) => {
        node.reference = null;

        if ( !parent || 'Element' !== parent.type ) {
            throw new Error( 'Usage {% block %} only with custom Component' );
        }

        const parentName = getTemplateName( parent.name );
        const blockName = getStringLiteralValue( node.name );
        const templateName = `${figure.name}_${parentName}_block_${blockName}_${figure.uniqid( 'template_name' )}`;
        const childName = 'child' + figure.uniqid( 'child_name' );
        figure.declare( `var ${childName} = {};` );

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

        compileBody( node.loc, node.body, templateName, childName );

        const varName = `block_${blockName}`;
        const blockVar = `${varName}${figure.uniqid( varName )}`;
        parent.addBlockMethod(
            sourceNode( node.loc, [
                `      var ${blockVar} = ${parent.childName}.blocks['${blockName}'];\n`,
                `      if (${blockVar}) {\n`,
                `        __UI__.insert(${blockVar}.component, ${blockVar}.node, ${childName}, ${templateName}, _this.__data__, ${parent.pathToDocument});\n`,
                '      }'
            ] )
        );

        return node.reference;
    }
};
