'use strict'

import * as vscode from 'vscode'

export type PortProvidedCallback = (int) => void

export class MoonSharpDebugConfigurationProvider implements vscode.DebugConfigurationProvider {

	onPortProvided: PortProvidedCallback

	constructor(onPortProvided: PortProvidedCallback)
	{
		this.onPortProvided = onPortProvided
	}

	public provideDebugConfigurations(folder: vscode.WorkspaceFolder | undefined, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration[]> {
		const path = folder ? folder.uri.fsPath : '${fileDirname}'
		return [
			{
				type: 'moonsharp-lua',
				name: 'Global',
				request: 'attach',
				path,
			}
		]
	}

	public async resolveDebugConfiguration?(folder: vscode.WorkspaceFolder | undefined, debugConfiguration: vscode.DebugConfiguration, token?: vscode.CancellationToken): Promise<vscode.DebugConfiguration | null> {
		const activeEditor = vscode.window.activeTextEditor

		if (debugConfiguration.type !== 'moonsharp-lua' && (!activeEditor || !activeEditor.document.languageId.endsWith('lua'))) {
			return debugConfiguration
		}

		// The built-in debugServer attribute bypasses the adapter factory and always
		// targets localhost; fold it into port so a custom host is honoured.
		if (debugConfiguration.debugServer) {
			debugConfiguration.port = debugConfiguration.port || debugConfiguration.debugServer
			delete debugConfiguration.debugServer
		}

		if (!debugConfiguration.port) {
			const inputPort = await vscode.window.showInputBox({
				value: '41912',
				prompt: 'MoonSharp server port',
				placeHolder: 'Port',
				validateInput: (value: string) => {
					const port = parseInt(value)
					return (port > 0 && port <= 65535) ? null : 'Not a valid port number'
				},
				ignoreFocusOut: true,
			})

			if (!inputPort) {
				return null
			}

			debugConfiguration.port = parseInt(inputPort)
		}

		if (!debugConfiguration.slave && this.onPortProvided) {
			this.onPortProvided(debugConfiguration.port)
		}

		return {
			name: 'Global',
			request: 'attach',
			mode: 'directory',
			pipeline: [],
			path: folder ? folder.uri.fsPath : (activeEditor ? activeEditor.document.uri.fsPath : null),
			...debugConfiguration,
			type: 'moonsharp-lua',
		}
	}
}
