import { join, resolve } from 'path'
import { promises as fs } from 'fs'
import type { ResolvedVitePWAOptions } from './types'
import { slash } from './utils'

export async function generateRegisterSW(options: ResolvedVitePWAOptions, mode: 'build' | 'dev', source = 'register') {
  const sw = slash(join(options.base, options.filename))
  const scope = options.scope

  const content = await fs.readFile(resolve(__dirname, `client/${mode}/${source}.mjs`), 'utf-8')

  return content
    .replace('__SW__', sw)
    .replace('__SCOPE__', scope)
    .replace('__SW_AUTO_UPDATE__', `${options.injectRegister === 'auto' && options.registerType === 'autoUpdate'}`)
}
