import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';
import { Schema } from '@schematics/angular/workspace/schema';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

const workspaceOptions: Schema = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '12.0.0'
};

describe('ng-add', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);
  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'workspace',
        workspaceOptions
      )
      .toPromise();
  });

  it('works', async () => {
    const tree = await runner
      .runSchematicAsync('ng-add', {}, appTree)
      .toPromise();

    expect(tree.files.includes('/.stylelintrc')).toBeTruthy();
    expect(tree.files.includes('/.prettierrc')).toBeTruthy();
    expect(tree.files.includes('/.prettierignore')).toBeTruthy();
  });
});
