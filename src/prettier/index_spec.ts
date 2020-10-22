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
  version: '10.0.0'
};

describe('prettier', () => {
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

  it('should create prettier files', async () => {
    const tree = await runner
      .runSchematicAsync('prettier', {}, appTree)
      .toPromise();

    expect(tree.files.includes('/.prettierrc')).toBeTruthy();
    expect(tree.files.includes('/.prettierignore')).toBeTruthy();
  });

  it('should add lint rule', async () => {
    const tree = await runner
      .runSchematicAsync('prettier', {}, appTree)
      .toPromise();

    const content = tree.readContent('/package.json');
    expect(content).toMatch('prettier -c *');
  });
});
