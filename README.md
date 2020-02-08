# Devfile YAML Editor

This extension has the goal of turning your current vscode project into a devfile and getting
you to try out Eclipse Che!

It does this by first, providing a command that allows you to generate a devfile for your current project.
You get to define your project name, your plugins [1], and your tooling containers.

Next, it brings yaml support via VSCode-YAML to provide you with an enhanced devfile editing experience,
so that every customization you want can be done before you even start a Che workspace.

Lastly, it gives you the ability to open your devfile inside of che.openshift.io to try out Che [2].

[1] - It tries to match your local vscode plugins against plugins that are already in the Che registry,
if it cannot find a perfect version match it will allow you to select the latest version of the plugin.

[2] - You must push your changes to your remote before you can use the `Open Devfile` command.

![Devfile Generation](https://github.com/JPinkney/devfile-yaml-editor/raw/master/demo/devfileGeneration.gif)

### Available Commands
The following commands are offered:

- `devfile.generate` - It helps you generate a devfile from your current VSCode workspace.
Available from the command palette with the label: `Generate a devfile for your current workspace`.

- `devfile.open` - It opens a devfile in che.openshift.io.
Available from the command palette with the label: `Open Devfile`.
Available from the context menu by right clicking on devfile.yaml.

