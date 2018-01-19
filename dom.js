const parse5 = require('parse5');
function injectRoot(html, rootNode, rootContainerId) {
    var doc = parse5.parse(html)
    var prerenderContent = parse5.parseFragment(rootNode)
    var rootContainer = getElementById(doc, rootContainerId)
    rootContainer.childNodes = rootContainer.childNodes.concat(prerenderContent.childNodes)
    return parse5.serialize(doc)
}

function injectStyles(html, styleNodes) {
    var doc = parse5.parse(html)
    var styleContent = parse5.parseFragment(styleNodes.join(''))
    var head = getElementByName(doc, 'head')
    head.childNodes = head.childNodes.concat(styleContent.childNodes)
    return parse5.serialize(doc)
}

function getElementById(node, id) {
    if (node.attrs && node.attrs.length > 0) {
        for (let i = 0; i < node.attrs.length; i++) {
            if (node.attrs[i].name === 'id' && node.attrs[i].value === id) {
                return node
            }
        }
    }

    if (node.childNodes && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
            let result = getElementById(node.childNodes[i], id)
            if (result !== undefined) {
                return result
            }
        }
    }
}

function getElementByName(node, name) {
    if (node.nodeName === name) {
        return node
    }

    if (node.childNodes && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
            let result = getElementByName(node.childNodes[i], name)
            if (result !== undefined) {
                return result
            }
        }
    }
}

module.exports = {
    injectRoot,
    injectStyles
}