import { execSync } from 'child_process'
import { commands } from './commands'

for (const command of commands)
  execSync(command, { stdio: 'inherit' })
