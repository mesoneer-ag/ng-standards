import {
  chain,
  noop,
  Rule,
  schematic,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function ngAdd(options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    return chain([
      schematic('prettier', { ...options, skipInstall: true }),
      schematic('stylelint', { ...options, skipInstall: true }),
      options.skipInstall ? noop : install()
    ]);
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
