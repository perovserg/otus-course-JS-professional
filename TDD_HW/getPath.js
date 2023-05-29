const getPath = (node, selector = '') => {
    if (node === undefined) {
        throw new Error('node is empty');
    }
    let parentNode = node.parentNode

    // go to parent if it exists
    if (
        parentNode != null
        && parentNode.localName !== undefined // document parent for html
        && parentNode.localName !== 'html'
    ) {
        selector = getPath(parentNode, selector).concat(' ')
    }

    selector = selector.concat(node.localName)

    // add to selector class or id
    if (node.className && node.className !== '') {
        selector = selector.concat('.', node.className.replace(/ /g, '.'))
    } else if (node.id && node.id !== '') {
        selector = selector.concat('#', node.id)
    }

    // add to selector child
    if (parentNode && parentNode.localName !== 'html' && parentNode.childElementCount > 1 && parentNode.firstChild === node) {
        selector = selector.concat(':first-child')
    } else if (parentNode && parentNode.localName !== 'html' && parentNode.childElementCount > 1 && parentNode.lastChild === node) {
        selector = selector.concat(':last-child')
    } else if (parentNode && parentNode.localName !== 'html' && parentNode.childElementCount > 1) {
        // find a number of a child
        let childNum = 0
        for (let i = 0; i < parentNode.childElementCount; i++) {
            if(parentNode.children[i] === node) {
                childNum = i + 1
            }
        }
        selector = selector.concat(`:nth-child(${childNum})`)
    }

    return selector;
};

exports.getPath = getPath;
