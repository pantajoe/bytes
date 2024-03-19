import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index.ts'],
  declaration: true,
  outDir: 'dist',
  rollup: {
    emitCJS: true,
  },
})
