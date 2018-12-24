import { visit } from '../visitor';
import { HTMLElements, SVGElements } from '../compiler/element';
import { ast } from '../parser';

export function defaultBlock( ast ) {
    visit( ast, {
        Element: ( node ) => {
            if (
                !HTMLElements.includes( node.name ) &&
                !SVGElements.includes( node.name ) &&
                node.body.length > 0
            ) {
                replaceBodyToUseDefaultBlock( node );
            }
        }
    } );
}

function replaceBodyToUseDefaultBlock( node ) {
    const useBlockNode = node.body.find( x => 'UseBlockStatement' === x.type );
    if ( undefined === useBlockNode ) {
        const useDefaultBlockNode = new ast.UseBlockStatementNode(
            new ast.LiteralNode( '\'default\'' ),
            node.body,
            node.loc
        );
        node.body = [ useDefaultBlockNode ];
    }
}

