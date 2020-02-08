import * as vscode from 'vscode';
import { getYAMLAPI, getSchemaContent, onRequestSchemaURI, DEVFILE_YAML_SCHEMA_NAME } from "./yaml-schema";
import { DevfileYAMLGeneration } from './devfile-yaml-generation';
import { TextEncoder } from 'util';
import open from 'open';
import { generateProjects } from './devfile-generation';

const generateDevfileCmdLabel = 'devfile.generate';
const openInCheLabel = 'devfile.open';

export async function activate(context: vscode.ExtensionContext) {
	const yamlAPI = await getYAMLAPI();
	if (yamlAPI) {
		const resolveSchemaContent = await getSchemaContent();
		yamlAPI.registerContributor(DEVFILE_YAML_SCHEMA_NAME, onRequestSchemaURI, () => resolveSchemaContent);
	}
	vscode.commands.registerCommand(generateDevfileCmdLabel, async () => {
		const devfileYAML = await (new DevfileYAMLGeneration().generateDevfileYAML());
		const workspaceRoot = vscode.workspace.workspaceFolders;
		if (workspaceRoot && workspaceRoot.length > 0) {
			let uri = workspaceRoot[0].uri.toString();
			uri += '/devfile.yaml';
			vscode.workspace.fs.writeFile(vscode.Uri.parse(uri), new TextEncoder().encode(devfileYAML));
		} else {
			vscode.window.showErrorMessage('No activate project found. Please open one.');
		}
	});
	vscode.commands.registerCommand(openInCheLabel, async () => {
		const projects = await generateProjects();
		if (projects.length > 0) {
			const firstProject = projects[0];
			const branch = firstProject.branch;
			let remote = firstProject.remote.replace('.git', '');
			const devfileString = `https://che.openshift.io/f?url=${remote}/tree/branch`;
			await open(devfileString, {
				url: true
			});
		}
	});
}

export function deactivate() {}
