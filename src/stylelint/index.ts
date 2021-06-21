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

export function stylelint(options: any): Rule {
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
    const dependencies = {
      stylelint: '13.13.1',
      'stylelint-config-idiomatic-order': '8.1.0',
      'stylelint-config-recommended-scss': '4.2.0',
      'stylelint-config-standard': '22.0.0',
      'stylelint-scss': '3.19.0'
    };

    Object.entries(dependencies).forEach(([name, version]) => {
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Dev,
        name,
        version
      });
    });
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

    if (!lintScripts.includes('stylelint "**/*.scss"')) {
      lintScripts.push('stylelint "**/*.scss"');
    }

    packageJson.scripts.lint = lintScripts
      .map((lint) => lint.trim())
      .join(' && ');
    tree.overwrite('package.json', JSON.stringify(packageJson, null, 2));
  };
}
