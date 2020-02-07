import * as vscode from 'vscode';
import { xhr } from 'request-light';

export const VSCODE_YAML_EXTENSION_ID = 'redhat.vscode-yaml';
export const DEVFILE_YAML_SCHEMA_NAME = 'che-meta-yaml';
export const SCHEMA_URL = 'https://raw.githubusercontent.com/eclipse/che/master/wsmaster/che-core-api-workspace/src/main/resources/schema/1.0.0/devfile.json';

declare type YamlSchemaContributor = (schema: string,
	requestSchema: (resource: string) => string | undefined,
	requestSchemaContent: (uri: string) => string) => void;

export async function getYAMLAPI(): Promise<{registerContributor: YamlSchemaContributor} | undefined> {
	const ext = vscode.extensions.getExtension(VSCODE_YAML_EXTENSION_ID);
	if (!ext) {
		vscode.window.showWarningMessage('You must have \'YAML Support by Red Hat\' installed in order to use this extension');
		return undefined;
	}
	const yamlPlugin = await ext.activate();
	if (!yamlPlugin || !yamlPlugin.registerContributor) {
        vscode.window.showWarningMessage('Please upgrade \'YAML Support by Red Hat\' via the Extensions pane.');
        return undefined;
	}
	return yamlPlugin;
}

export function onRequestSchemaURI(resource: string): string | undefined {
	if (resource.endsWith('/devfile.yaml')) {
		return `${DEVFILE_YAML_SCHEMA_NAME}://schema/devfile`;
	}
	return undefined;
}

export async function getSchemaContent() {
	const response = await xhr({ url: SCHEMA_URL });
	return response.responseText;
}
