import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

async function cleanNodeModules() {
  try {
    const workspacePath = path.join(ROOT_DIR, 'pnpm-workspace.yaml');

    console.log(`📂 Working Directory: ${ROOT_DIR}`);

    const workspaceYaml = await fs.readFile(workspacePath, 'utf8');
    const config = yaml.load(workspaceYaml);
    const patterns = config.packages || [];

    const targets = ['node_modules', ...patterns.map((p) => path.join(p, 'node_modules').replace(/\\/g, '/'))];

    const foldersToDelete = await glob(targets, {
      cwd: ROOT_DIR,
      onlyDirectories: true,
      absolute: true,
    });

    if (foldersToDelete.length === 0) {
      console.log('✅ Everything is already clean.');
      return;
    }

    for (const folder of foldersToDelete) {
      console.log(`🗑️ Removing: ${folder}`);
      await fs.rm(folder, { recursive: true, force: true });
    }

    console.log(`\n✨ Done! Deleted ${foldersToDelete.length} directories.`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanNodeModules();
