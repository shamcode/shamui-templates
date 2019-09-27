import { visit } from '../visitor';

export function collectVariables( scope, node ) {
    const variables = [];
    if ( node ) {
        const nodes = [].concat( node );
        nodes.forEach( ( node ) => {
            visit( node, {
                Identifier: ( node ) => {
                    if ( variables.indexOf( node.name ) === -1 &&
                        scope.indexOf( node.name ) === -1 ) {
                        variables.push( node.name );
                    }
                }
            } );
        } );
    }
    return variables;
}
