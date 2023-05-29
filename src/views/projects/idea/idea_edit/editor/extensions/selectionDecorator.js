// import { Extension } from '@tiptap/core'
// import { Plugin, PluginKey } from "prosemirror-state";
// import { Decoration, DecorationSet } from 'prosemirror-view'

// let decorationSet

// export const SelectionDecorator = Extension.create({
//   name: 'selectionDecorator',

//   addProseMirrorPlugins() {
//     const { editor: { view: { dispatch }} } = this

//     let alreadyFocused = false

//     console.log("HELLO WORLD")

//     const paragraphSelectorPlugin = new Plugin({
//       key: new PluginKey('paragraphSelectorPlugin'),
//       props: {
//         decorations(state) {
//           return this.getState(state)
//         },
//       },
//       appendTransaction: (tr, state, newState) => {
//         if (alreadyFocused) {
//           alreadyFocused = false
//           return 
//         }
//         const { selection, doc } = newState

//         // only do it when it's not empty
//         if (selection.empty) {
//           decorationSet = DecorationSet.empty
//           return decorationSet
//         }

//         const { from: selectionFrom, to: selectionTo } = selection;

//         let nodeWithPos = {
//           node: null,
//           from: 0,
//           to: 0
//         };

//         doc.descendants((node, pos, parent) => {
//           if (!node.isBlock || nodeWithPos.node) return false;

//           const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize];

//           const nodeContainsSelection = nodeFrom <= selectionFrom && selectionFrom <= nodeTo

//           if (nodeContainsSelection) nodeWithPos = { node, from: nodeFrom, to: nodeTo }
//         });

//         if (!nodeWithPos.node) {
//           decorationSet = DecorationSet.empty
//           return decorationSet
//         }

//         const selectionDecoration = Decoration.inline(nodeWithPos.from, nodeWithPos.to, {
//           class: `selection-decoration`,
//           nodeName: 'span',
//         })

//         decorationSet = DecorationSet.create(doc, [selectionDecoration])
//         // dispatch(state.tr.setSelection(selection))
//         if (!alreadyFocused) {
//           alreadyFocused = true
//         }
//       },
//       state: {
//         init: (config, state) => {
//           decorationSet = DecorationSet.create(state.doc, [])

//           return decorationSet
//         },
//         apply: () => decorationSet,
//       },
//     })

//     return [paragraphSelectorPlugin]
//   }
// })
