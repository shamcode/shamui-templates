import { sourceNode } from './sourceNode';
import { getStringLiteralValue } from '../utils';

export default {
    DefBlockStatement: ( { node, figure } ) => {
        const name = getStringLiteralValue( node.name );
        const placeholder = `${name}Block`;
        node.reference = placeholder;
        figure.blocksNeed = true;
        figure.declare(
            sourceNode( `const ${placeholder} = document.createComment( '${name}' );` )
        );
        figure.addBlock(
            sourceNode( [
                `        this.blocks[ '${name}' ] = {\n`,
                `            node: ${placeholder},\n`,
                '            component: this\n',
                '        };'
            ] )
        );
        figure.addOnRemove(
            sourceNode( node.loc, [
                `            delete this.blocks[ '${name}' ];`
            ] )
        );
        figure.root().blocksNeed = true;
        return node.reference;
    }
};
