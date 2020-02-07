import * as vscode from 'vscode';
import { execFileSync } from 'child_process';
import pluginRegistryCache from './plugin-registry-cache.json';
import quayToolingCache from './quay-tooling-container-cache.json';

export async function generateName(): Promise<string> {
    return new Promise(resolve => {
        const inputBox = vscode.window.createInputBox();
        inputBox.placeholder = 'Enter the name you want to want to use in the devfile';
        inputBox.onDidAccept(e => {
            resolve(inputBox.value);
            inputBox.hide();
        });
        inputBox.show();
    });
}

export interface Project {
    branch: string;
    remote: string;
}

export async function generateProjects(): Promise<Project[]> {
    const projects: Project[] = [];
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        workspaceFolders.forEach(folder => {
            const branch = runCommand(folder.uri.fsPath, "rev-parse --abbrev-ref HEAD").trim();
            const remote = runCommand(folder.uri.fsPath, "config --get remote.origin.url").trim();
            projects.push({
                branch,
                remote
            });
        });
    }
    return projects;
}

function runCommand(directory: string, cmd: string) {
    return execFileSync('git', cmd.split(' '), {
        cwd: directory,
        encoding: "utf8"
    });
}

export interface Plugin {
    type: string;
    id: string;
    alias: string;
}

export async function generatePlugins(): Promise<Plugin[]> {
    // Get plugins from the registry
    const plugins: Plugin[] = [];
    const fallbackVersions = new Map<string, Plugin>();
    const registrySet = new Map<string, any>();
    pluginRegistryCache.forEach(x => {
        registrySet.set(x.id, x);
    });
    vscode.extensions.all.forEach(y => {
        const [ publisher, plugin ]  = y.packageJSON.id.split('.');
        const version = y.packageJSON.version;
        const qualifiedId = `${publisher}/${plugin}/${version}`;

        const potentialPlugin = registrySet.get(qualifiedId);
        if (potentialPlugin) {
            plugins.push({
                alias: potentialPlugin.name,
                id: qualifiedId,
                type: "chePlugin"
            });
        } else {
            const latestQualifiedId = `${publisher}/${plugin}/latest`;
            const latestPlugin = registrySet.get(latestQualifiedId);
            if (latestPlugin) {
                fallbackVersions.set(latestQualifiedId, {
                    alias: latestPlugin.name,
                    id: latestQualifiedId,
                    type: "chePlugin"
                });
            }
        }
    });

    /**
     * We need to go through the fallback plugins and show the multi step selection things to see which
     * of them they want to keep
     */
    if (fallbackVersions.size > 0) {
        return new Promise(resolve => {
            const quickPick = vscode.window.createQuickPick();
            quickPick.items = Array.from(fallbackVersions.values()).map(x => {
                return {
                    label: x.id,
                };
            }) as vscode.QuickPickItem[];
            quickPick.placeholder = "Not all of your extensions could be exactly matched by version. Please select any that you want to have as latest";
            quickPick.canSelectMany = true;
            quickPick.onDidAccept(e => {
                const selectedItems = quickPick.selectedItems;
                const selectedToPlugin = selectedItems.map(id => fallbackVersions.get(id.label) as Plugin);
                resolve(selectedToPlugin);
                quickPick.hide();
            });
            quickPick.show();
        });
       
    }

    return plugins;
}

export interface ToolingContainer {
    name: string;
    description: string;
    image: string;
}

async function generateToolingContainers(): Promise<ToolingContainer[]> {
    const supportedToolingContainers = new Set([
        'node',
        'nodejs8',
        'nodejs10',
        'java',
        'java8',
        'java11',
        'quarkus',
        'php',
        'python',
        'cpp',
        'dotnet',
        'golang'
    ]);
    
    const toolingContainers = new Map<string, ToolingContainer>();
    quayToolingCache.forEach(element => {
        const result = element.results;
        result.forEach(repo => {
            const name = repo.name;

            const [ che, prog, ver ] = name.split('-');
            if (che === 'che' && supportedToolingContainers.has(prog)) {
                toolingContainers.set(name, {
                    name,
                    description: repo.description ? repo.description : "",
                    image: `quay.io/eclipse/${name}:nightly`
                });
            }
        });
    });

    return new Promise(resolve => {
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = Array.from(toolingContainers.values()).map(x => {
            return {
                label: x.name,
                description: x.description
            };
        }) as vscode.QuickPickItem[];
        quickPick.placeholder = "Please select all the tooling containers you would like";
        quickPick.canSelectMany = true;
        quickPick.onDidAccept(e => {
            const selectedItems = quickPick.selectedItems;
            const selectedToToolingContainer = selectedItems.map(id => toolingContainers.get(id.label) as ToolingContainer);
            resolve(selectedToToolingContainer);
            quickPick.hide();
        });
        quickPick.show();
    });
}

export interface DevfileInformation {
    name: string;
    projects: Project[];
    plugins: Plugin[];
    toolingContainers: ToolingContainer[];
}

export async function generateDevfile(): Promise<DevfileInformation> {
    const name = await generateName();
    const projects = await generateProjects();
    const plugins = await generatePlugins();
    const toolingContainers = await generateToolingContainers();
    return {
        name,
        projects,
        plugins,
        toolingContainers
    };
}