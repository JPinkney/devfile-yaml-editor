import * as vscode from 'vscode';
import { getYAMLAPI, getSchemaContent, onRequestSchemaURI, DEVFILE_YAML_SCHEMA_NAME } from "./yaml-schema";
import { DevfileYAMLGeneration } from './devfile-yaml-generation';
import { TextEncoder } from 'util';

const generateDevfileCmdLabel = 'devfile.generate';

export async function activate(context: vscode.ExtensionContext) {
	const yamlAPI = await getYAMLAPI();
	if (yamlAPI) {
		const resolveSchemaContent = await getSchemaContent();
		yamlAPI.registerContributor(DEVFILE_YAML_SCHEMA_NAME, onRequestSchemaURI, () => resolveSchemaContent);
	}
	vscode.commands.registerCommand(generateDevfileCmdLabel, async () => {
		const devfileYAML = await (new DevfileYAMLGeneration().generateDevfileYAML());
		console.log(devfileYAML);
		const workspaceRoot = vscode.workspace.workspaceFolders;
		if (workspaceRoot && workspaceRoot.length > 0) {
			let uri = workspaceRoot[0].uri.toString();
			uri += '/Devfile.yaml';
			vscode.workspace.fs.writeFile(vscode.Uri.parse(uri), new TextEncoder().encode(devfileYAML));
		} else {
			vscode.window.showErrorMessage('No activate project found. Please open one.');
		}
	});
}

export function deactivate() {}
