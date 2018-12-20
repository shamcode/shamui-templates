
export default {
    DefBlockStatement: ( { parent, node, figure, compile } ) => {
        node.reference = null;

        return node.reference;
    }
};
