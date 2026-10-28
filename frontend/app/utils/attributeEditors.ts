import type { Component } from 'vue'
import BoldEditor from '~/components/editors/BoldEditor.vue'
import BorderEditor from '~/components/editors/BorderEditor.vue'
import ColorEditor from '~/components/editors/ColorEditor.vue'
import FontSizeEditor from '~/components/editors/FontSizeEditor.vue'
import type { Attributes } from '~/types/board'

// Which editor edits which attribute. The context bar shows an editor only if the
// selected object has its attribute. Every editor takes `value` and emits `change`.
export const ATTRIBUTE_EDITORS: { attribute: keyof Attributes, label: string, component: Component }[] = [
  { attribute: 'color', label: 'Farbe', component: ColorEditor },
  { attribute: 'fontSize', label: 'Schriftgröße', component: FontSizeEditor },
  { attribute: 'bold', label: 'Fett', component: BoldEditor },
  { attribute: 'border', label: 'Rahmen', component: BorderEditor },
]
