import { generateDevfile, Project, Plugin, ToolingContainer } from "./devfile-generation";

export class DevfileYAMLGeneration {
    
    private DevfileYAML = 'apiVersion: 1.0.0\n';

    async generateDevfileYAML() {
        const { name, projects, plugins, toolingContainers } = await generateDevfile();
        this.createNameYAML(name);
        this.createProjectsYAML(projects);
        this.createPluginsAndToolingYAML(plugins, toolingContainers);
        return this.DevfileYAML;
    }

    private createNameYAML(name: string): void {
        this.DevfileYAML += `metadata:\n  generateName: ${name}-\n`;
    }

    /**
     * -
     name: example
     source:
        type: git
        location: https://github.com/myrepo/example.git
    */
    private createProjectsYAML(projects: Project[]): void {
        if (projects.length === 0) {
            this.DevfileYAML += 'projects: []\n';
            return;
        }
        
        this.DevfileYAML += 'projects:\n';
        projects.forEach(proj => {
            /**
             * Turn something like https://github.com/myrepo/example.git
             * into example
             */
            const extractNameFromRemote = proj.remote.split('/').slice(-1)[0].replace('.git', '');
            this.DevfileYAML += `- name: ${extractNameFromRemote}\n`;
            this.DevfileYAML += `  source:\n    type: git\n    location: ${proj.remote}\n    branch: ${proj.branch}\n`;
        });
    }

    private createPluginsAndToolingYAML(plugins: Plugin[], tooling: ToolingContainer[]): void {
        if (plugins.length === 0 && tooling.length === 0) {
            this.DevfileYAML += 'components: []\n';
            return;
        }

        this.DevfileYAML += 'components:\n';
        plugins.forEach(plugin => {
            this.DevfileYAML += `- id: ${plugin.id}\n`;
            this.DevfileYAML += `  alias: ${plugin.alias}\n`;
            this.DevfileYAML += `  type: ${plugin.type}\n`;
        });
        tooling.forEach(tooling => {
            this.DevfileYAML += `- type: dockerimage\n`;
            this.DevfileYAML += `  alias: ${tooling.name}\n`;
            this.DevfileYAML += `  image: ${tooling.image}\n`;
            this.DevfileYAML += `  memoryLimit: 256Mi\n`;
        });
    }

}
