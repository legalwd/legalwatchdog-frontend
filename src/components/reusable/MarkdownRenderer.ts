import { marked } from 'marked'
import type { Token, Tokens, TokensList } from 'marked'
import { defineComponent, h } from 'vue'
import type { VNodeChild } from 'vue'

const renderInline = (tokens: Token[]): VNodeChild[] =>
  tokens.map((token, index) => {
    const key = `${token.type}-${index}`
    switch (token.type) {
      case 'strong': {
        const strongToken = token as Tokens.Strong
        return h(
          'strong',
          { key, class: 'text-foreground font-semibold' },
          renderInline(strongToken.tokens),
        )
      }
      case 'em': {
        const emToken = token as Tokens.Em
        return h('em', { key, class: 'text-foreground italic' }, renderInline(emToken.tokens))
      }
      case 'codespan': {
        const codeToken = token as Tokens.Codespan
        return h(
          'code',
          { key, class: 'bg-muted-background text-foreground rounded px-1 py-0.5 text-xs' },
          codeToken.text,
        )
      }
      case 'link': {
        const linkToken = token as Tokens.Link
        return h(
          'a',
          {
            key,
            href: linkToken.href,
            title: linkToken.title || undefined,
            class: 'text-primary underline underline-offset-4',
            rel: 'noopener noreferrer',
            target: '_blank',
          },
          renderInline(linkToken.tokens),
        )
      }
      case 'br':
        return h('br', { key })
      case 'text': {
        const textToken = token as Tokens.Text
        if (textToken.tokens && textToken.tokens.length) {
          return renderInline(textToken.tokens)
        }
        return textToken.text
      }
      case 'escape':
        return (token as Tokens.Escape).text
      case 'del': {
        const delToken = token as Tokens.Del
        return h('del', { key, class: 'text-muted line-through' }, renderInline(delToken.tokens))
      }
      case 'image': {
        const imageToken = token as Tokens.Image
        return imageToken.text || ''
      }
      default:
        return token.raw || ''
    }
  })

const normalizeListItemTokens = (item: Tokens.ListItem): Token[] => {
  if (item.tokens.length === 1 && item.tokens[0]?.type === 'paragraph') {
    return (item.tokens[0] as Tokens.Paragraph).tokens
  }
  return item.tokens
}

const renderTableCellContent = (cell: Tokens.TableCell): VNodeChild[] | string => {
  if (Array.isArray(cell.tokens) && cell.tokens.length) {
    return renderInline(cell.tokens)
  }
  return cell.text || ''
}

const tableAlignClass = (align: Tokens.TableCell['align']): string => {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return 'text-left'
}

const renderBlocks = (tokens: Token[]): VNodeChild[] =>
  tokens.map((token, index) => {
    const key = `${token.type}-${index}`
    switch (token.type) {
      case 'heading': {
        const headingToken = token as Tokens.Heading
        const depth = Math.min(Math.max(headingToken.depth || 2, 1), 4)
        const tag = `h${depth}`
        const sizeClass =
          depth === 1 ? 'text-xl' : depth === 2 ? 'text-lg' : depth === 3 ? 'text-base' : 'text-sm'
        return h(
          tag,
          { key, class: `text-foreground mt-4 font-semibold ${sizeClass}` },
          renderInline(headingToken.tokens),
        )
      }
      case 'paragraph': {
        const paragraphToken = token as Tokens.Paragraph
        return h(
          'p',
          { key, class: 'text-muted text-sm leading-relaxed' },
          renderInline(paragraphToken.tokens),
        )
      }
      case 'list': {
        const listToken = token as Tokens.List
        const tag = listToken.ordered ? 'ol' : 'ul'
        const listClass = listToken.ordered ? 'list-decimal' : 'list-disc'
        return h(
          tag,
          { key, class: `text-muted mt-2 space-y-1 pl-5 text-sm ${listClass}` },
          listToken.items.map((item, itemIndex) =>
            h(
              'li',
              { key: `${key}-item-${itemIndex}` },
              renderInline(normalizeListItemTokens(item)),
            ),
          ),
        )
      }
      case 'blockquote': {
        const blockquoteToken = token as Tokens.Blockquote
        return h(
          'blockquote',
          { key, class: 'border-border text-muted border-l-2 pl-4 text-sm italic' },
          renderBlocks(blockquoteToken.tokens),
        )
      }
      case 'code': {
        const codeToken = token as Tokens.Code
        return h('pre', { key, class: 'bg-muted-background rounded-lg p-4 text-xs' }, [
          h('code', { class: 'text-foreground block whitespace-pre-wrap' }, codeToken.text || ''),
        ])
      }
      case 'table': {
        const tableToken = token as Tokens.Table
        const headerCells = tableToken.header.map((cell, cellIndex) =>
          h(
            'th',
            {
              key: `${key}-head-${cellIndex}`,
              class: `text-foreground border-border border-b px-3 py-2 text-xs font-semibold ${tableAlignClass(cell.align)}`,
            },
            renderTableCellContent(cell),
          ),
        )
        const bodyRows = tableToken.rows.map((row, rowIndex) =>
          h(
            'tr',
            { key: `${key}-row-${rowIndex}` },
            row.map((cell, cellIndex) =>
              h(
                'td',
                {
                  key: `${key}-cell-${rowIndex}-${cellIndex}`,
                  class: `text-muted border-border border-b px-3 py-2 text-xs ${tableAlignClass(cell.align)}`,
                },
                renderTableCellContent(cell),
              ),
            ),
          ),
        )
        return h('div', { key, class: 'border-border overflow-x-auto rounded-lg border' }, [
          h('table', { class: 'w-full border-collapse' }, [
            h('thead', {}, [h('tr', {}, headerCells)]),
            h('tbody', {}, bodyRows),
          ]),
        ])
      }
      case 'hr':
        return h('hr', { key, class: 'border-border my-4' })
      case 'space':
        return null
      default:
        return null
    }
  })

const normalizeMarkdown = (markdown: string): string => {
  let normalized = (markdown || '').replace(/\r\n/g, '\n')

  // Some generated markdown tables arrive collapsed into one line with row separators as `| |`.
  // Normalize them to proper GFM table rows so marked can tokenize as a table.
  if (normalized.includes('|---')) {
    normalized = normalized.replace(/\s+\|\s+\|---/g, '\n|---')
    normalized = normalized.replace(/\|\s+\|/g, '|\n|')
  }

  return normalized
}

const buildTokens = (markdown: string): TokensList =>
  marked.lexer(normalizeMarkdown(markdown), { breaks: true, gfm: true }) as TokensList

const MarkdownRenderer = defineComponent({
  name: 'MarkdownRenderer',
  props: {
    markdown: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const tokens = buildTokens(props.markdown)
      return h('div', { class: 'space-y-3' }, renderBlocks(tokens))
    }
  },
})

export default MarkdownRenderer
