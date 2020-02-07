import { generateDevfile, Project, Plugin, ToolingContainer } from "./devfile-generation";

let DevfileYAML = 'apiVersion: v1\n';

export async function generateDevfileYAML() {
    const { name, projects, plugins, toolingContainers } = await generateDevfile();
    createNameYAML(name);
    createProjectsYAML(projects);
    createPluginsAndToolingYAML(plugins, toolingContainers);
    return DevfileYAML;
}

function createNameYAML(name: string): void {
    DevfileYAML += `metadata:\n  generateName: ${name}-\n`;
}

/**
 * -
  name: example
  source:
    type: git
    location: https://github.com/myrepo/example.git
 */
function createProjectsYAML(projects: Project[]): void {
    DevfileYAML += 'projects:\n';
    projects.forEach(proj => {
        /**
         * Turn something like https://github.com/myrepo/example.git
         * into example
         */
        const extractNameFromRemote = proj.remote.split('/').slice(-1)[0].replace('.git', '');
        DevfileYAML += `- name: ${extractNameFromRemote}\n`;
        DevfileYAML += `  source:\n    type: git\n    location: ${proj.remote}\n    branch: ${proj.branch}\n`;
    });
}

function createPluginsAndToolingYAML(plugins: Plugin[], tooling: ToolingContainer[]): void {
    DevfileYAML += 'components:\n';
    plugins.forEach(plugin => {
        DevfileYAML += `- id: ${plugin.id}\n`;
        DevfileYAML += `  alias: ${plugin.alias}\n`;
        DevfileYAML += `  type: ${plugin.type}\n`;
    });
    tooling.forEach(tooling => {
        DevfileYAML += `- type: dockerimage\n`;
        DevfileYAML += `  alias: ${tooling.name}\n`;
        DevfileYAML += `  image: ${tooling.image}\n`;
    });
}