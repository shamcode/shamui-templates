import { sourceNode } from './sourceNode';
import { getStringLiteralValue } from '../utils';

export default {
    DefBlockStatement: ( { node, figure } ) => {
        const name = getStringLiteralValue( node.name );
        const placeholder = `${name}Block`;
        node.reference = placeholder;
        figure.declare(
            sourceNode( `var ${placeholder} = document.createComment('${name}');` )
        );
        figure.addBlock(
            sourceNode( `  '${name}': ${placeholder}` )
        );
        return node.reference;
    }
};
