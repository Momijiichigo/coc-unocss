import path from 'path'

import {
  ExtensionContext,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
  services,
  workspace,
} from 'coc.nvim'

interface CocUnocssConfig {
  enable: boolean
}


function dedup<T>(arr1: T[], arr2: T[]): T[] {
  const set = new Set(arr1)
  for (const item of arr2) {
    set.add(item)
  }
  return [...set]
}

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration().get('unocss') as CocUnocssConfig

  if (config.enable === false) {
    return
  }

  const serverModule = context.asAbsolutePath(
    path.join('node_modules', 'unocss-language-server', 'bin', 'index.js')
  )

  const serverOptions: ServerOptions = {
    module: serverModule,
    transport: TransportKind.ipc,
    args: ['--node-ipc'],
  }

  const filetypes: string[] = (() => {
    const ft = workspace.getConfiguration('unocss').get('filetypes')
    if (Array.isArray(ft)) return ft
    if (typeof ft === 'string') return [ft]
    throw new Error('unocss.filetypes must be string[] or string')
  })()

  const clientOptions: LanguageClientOptions = {
    documentSelector: dedup(filetypes, [
      'vue',
      'html',
      'svelte',
      'javascript',
      'javascriptreact',
      'typescript',
      'typescriptreact',
    ]),
  }

  const client = new LanguageClient(
    'unocss',
    'UnoCSS Language Server',
    serverOptions,
    clientOptions
  )

  context.subscriptions.push(services.registLanguageClient(client))
}
