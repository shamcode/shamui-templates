import { visit } from '../visitor';

export function sfc( ast, options ) {
    if ( !options.asSingleFileComponent ) {
        return;
    }
    visit( ast, {
        Document: ( node ) => {
            const templateIndex = node.body.findIndex(
                elem => 'Element' === elem.type && 'template' === elem.name
            );
            node.body.splice( templateIndex, 1, ...node.body[ templateIndex ].body );
        }
    } );
}
