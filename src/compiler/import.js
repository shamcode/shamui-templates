import { sourceNode } from './sourceNode';

export default {

    /**
     * @return {null}
     */
    ImportStatement: ( { node, figure, options } ) => {
        const importNode = sourceNode( node.loc,
            options.asSingleFileComponent ?
                `import ${node.identifier.name} from ${node.path.value};` :
                `var ${node.identifier.name} = __requireDefault(require(${node.path.value}));`
        );

        figure.root().addImport( importNode, !options.asSingleFileComponent );

        figure.addToScope( node.identifier.name );

        return null;
    }
};
