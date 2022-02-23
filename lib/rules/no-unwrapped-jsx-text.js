'use strict'

const RULE_DESCRIPTION = 'JSX text that share a common parent with other elements should be wrapped by a <span> tag'

/***
 ***  RULE DEFINITION
 */

module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: RULE_DESCRIPTION,
      category: 'Possible Errors',
      url: 'https://github.com/sayari-analytics/graph-ui/issues/901'
    },
    messages: {
      noUnwrappedJSX: 'No unwrapped JSX text'
    }
  },
  create: function(context) {
    return {
      // Imagine evaluating <div>text {conditional && 'string'}</div>
      JSXExpressionContainer(node) {
        // We start at the expression {conditional && 'string'}
        if (node.expression.type !== 'LogicalExpression') return

        // "text" is one of the siblingTextNodes.
        const siblingTextNodes = (node.parent.children || []).filter(n => {
          // In normal code these are 'Literal', but in test code they are 'JSXText'
          const isText = n.type === 'Literal' || n.type === 'JSXText'
          // Skip empty text nodes, like "   \n   " -- these may be JSX artifacts
          return isText && !!n.value.trim()
        })

        // If we were evaluting
        //   <div>{property} {conditional && 'string'}</div>
        // Then {property} would be one of the siblingExpressionNodes
        const siblingExpressionNodes = (node.parent.children || []).filter(
          n =>
            n.type === 'JSXExpressionContainer' &&
            (n.expression.type === 'Identifier' ||
              n.expression.type === 'MemberExpression')
        )

        // Operands of {conditional && 'string'} -- the conditional and the
        // literal. We want to make sure we have a text literal, otherwise we'd
        // trigger this rule on the (safe) {conditional && <div>string</div>}.
        const expressionOperandTypes = [
          node.expression.left.type,
          node.expression.right.type,
        ]
        if (
          siblingTextNodes.concat(siblingExpressionNodes).length > 0 &&
          expressionOperandTypes.includes('Literal')
        ) {
          context.report({ node, messageId: 'unexpected' })
        }
      },
    }
  }
}
