import { sourceNode } from './sourceNode';
import { getStringLiteralValue } from '../utils';

export default {
    DefBlockStatement: ( { node, figure } ) => {
        const name = getStringLiteralValue( node.name );
        const placeholder = `${name}Block`;
        node.reference = placeholder;
        figure.thisRef = true;
        figure.declare(
            sourceNode( `const ${placeholder} = document.createComment( '${name}' );` )
        );

        figure.addRenderActions(
            sourceNode( [
                `            if ( _this.blocks[ '${name}' ] ) {\n`,
                `                _this.blocks[ '${name}' ]( ${placeholder}, _this );\n`,
                '            }'
            ] )
        );
        return node.reference;
    }
};
