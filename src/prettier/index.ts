import { normalize, strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependencyType
} from '@schematics/angular/utility/dependencies';

export function prettier(options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return chain([
      addTemplateFiles(options),
      addDependencies(),
      options.skipInstall ? noop : install(),
      addLintScript()
    ])(tree, context);
  };
}

/**
 * Add required dependencies to package.json file.
 */
function addDependencies(): Rule {
  return (tree: Tree) => {
    const dependency = {
      type: NodeDependencyType.Dev,
      name: 'prettier',
      version: '2.1.2'
    };

    addPackageJsonDependency(tree, dependency);
  };
}

/**
 * Add schematic templates from `./files` to the target application
 */
function addTemplateFiles(options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const sourceTemplates = url('./files');

    const sourceParamteterizedTemplates = apply(sourceTemplates, [
      template({
        ...options,
        ...strings
      }),
      move(normalize('./'))
    ]);
    return mergeWith(sourceParamteterizedTemplates)(tree, context);
  };
}

/**
 * Install Node dependencies
 */
function install(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    // Install the dependency
    context.addTask(new NodePackageInstallTask());
    return tree;
  };
}

function addLintScript(): Rule {
  return (tree: Tree) => {
    const packageJsonBuffer = tree.read('package.json');
    if (!packageJsonBuffer) {
      throw new SchematicsException('Could not find package.json');
    }
    const packageJson = JSON.parse(packageJsonBuffer.toString());

    const lintScripts: string[] = packageJson.scripts.lint
      ? packageJson.scripts.lint.split('&&')
      : [];

    if (!lintScripts.includes('prettier -c *')) {
      lintScripts.push('prettier -c *');
    }

    packageJson.scripts.lint = lintScripts
      .map((lint) => lint.trim())
      .join(' && ');
    tree.overwrite('package.json', JSON.stringify(packageJson, null, 2));
  };
}
