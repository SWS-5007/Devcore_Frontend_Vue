import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'

export interface FocusOptions {
  className: string,
  mode: 'all' | 'deepest' | 'shallowest',
}

export const FocusNode = Extension.create<FocusOptions>({
  name: 'focusNode',

  addOptions() {
    return {
      className: 'node-has-focus',
      mode: 'deepest',
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('focusNode'),
        props: {
          decorations: ({ doc, selection }) => {
            const { anchor, from, to } = selection
            const decorations: Decoration[] = []
            const className = this.options.className

            if (from === to) return DecorationSet.create(doc, [])

            // Maximum Levels
            let maxLevels = 0

            if (this.options.mode === 'deepest') {
              doc.descendants((node, pos) => {
                if (node.isText) return

                const isCurrent = anchor >= pos && anchor <= (pos + node.nodeSize - 1)

                if (!isCurrent) return false

                maxLevels += 1
              })
            }

            // Loop through current
            let currentLevel = 0

            doc.descendants((node, pos) => {
              if (node.isText) return false

              const isCurrent = anchor >= pos && anchor <= (pos + node.nodeSize - 1)

              if (!isCurrent) return false

              currentLevel += 1

              const outOfScope = (this.options.mode === 'deepest' && maxLevels - currentLevel > 0)
                || (this.options.mode === 'shallowest' && currentLevel > 1)

              if (outOfScope) return this.options.mode === 'deepest'

              decorations.push(Decoration.node(pos, pos + node.nodeSize, { class: className }))
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
