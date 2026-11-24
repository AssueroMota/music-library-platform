import ts from 'typescript'

const textAttributes = new Set([
  'alt',
  'aria-label',
  'description',
  'eyebrow',
  'heading',
  'href',
  'label',
  'placeholder',
  'subtitle',
  'text',
  'title',
])

export function transformSiteMessages(code, filename, lookup) {
  const source = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true)
  const edits = []

  function visit(node) {
    let kind
    let message
    let spans = []
    if (ts.isJsxText(node)) {
      kind = 'jsx'
      message = source.text.slice(node.pos, node.end).trim().replace(/\s+/g, ' ')
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent = node.parent
      if (ts.isJsxAttribute(parent) && !textAttributes.has(parent.name.getText(source))) return
      if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) return
      if (ts.isPropertyAssignment(parent) && parent.name === node) return
      if (filename.endsWith('/setlists.ts') && ts.isArrayLiteralExpression(parent)) return
      if (filename.endsWith('/setlists-complete.ts') && ts.isArrayLiteralExpression(parent)) {
        const index = parent.elements.indexOf(node)
        if (
          parent.elements.length < 5 ||
          !ts.isArrayLiteralExpression(parent.elements[4]) ||
          index < 1 ||
          index > 3
        )
          return
      }
      kind = ts.isJsxAttribute(parent) ? 'attribute' : 'string'
      message = node.text
    } else if (ts.isTemplateExpression(node)) {
      kind = 'template'
      spans = node.templateSpans.map((span) => span.expression.getText(source))
      message =
        node.head.text + node.templateSpans.map((span, i) => `{${i}}${span.literal.text}`).join('')
    }

    if (message) {
      const translated = lookup(message, kind, node, source)
      if (translated !== undefined && translated !== message) {
        let replacement
        if (kind === 'template') {
          const escape = (text) => text.replace(/[`\\]/g, '\\$&').replaceAll('${', '\\${')
          replacement =
            '`' +
            translated
              .split(/(\{\d+\})/g)
              .map((part, i) =>
                i % 2 ? '${' + spans[Number(part.slice(1, -1))] + '}' : escape(part),
              )
              .join('') +
            '`'
        } else if (kind === 'jsx' || kind === 'attribute') {
          const escaped = translated.replace(
            /[&<>"{}]/g,
            (char) =>
              ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                '{': '&#123;',
                '}': '&#125;',
              })[char],
          )
          if (kind === 'attribute') replacement = `"${escaped}"`
          else {
            const original = source.text.slice(node.pos, node.end)
            replacement =
              (original.match(/^\s*/)?.[0] ?? '') + escaped + (original.match(/\s*$/)?.[0] ?? '')
          }
        } else replacement = JSON.stringify(translated)
        edits.push([kind === 'jsx' ? node.pos : node.getStart(source), node.end, replacement])
        return
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(source)
  for (const [start, end, replacement] of edits.reverse()) {
    code = code.slice(0, start) + replacement + code.slice(end)
  }
  return code
}
