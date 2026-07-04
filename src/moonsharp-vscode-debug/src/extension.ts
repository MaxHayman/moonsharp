'use strict'

import * as vscode from 'vscode'

import {MoonSharpDebugConfigurationProvider} from './moonSharpDebugConfiguration'

class MoonSharpDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {
	createDebugAdapterDescriptor(session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
		const config = session.configuration
		const port = config.port || 41912
		const host = config.host || '127.0.0.1'
		return new vscode.DebugAdapterServer(port, host)
	}
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.debug.registerDebugConfigurationProvider(
			'moonsharp-lua',
			new MoonSharpDebugConfigurationProvider(() => {})
		),
		vscode.debug.registerDebugAdapterDescriptorFactory(
			'moonsharp-lua',
			new MoonSharpDebugAdapterDescriptorFactory()
		)
	)
}

export function deactivate() {
}
