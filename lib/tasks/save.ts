import {
  existsSync,
  mkdirSync,
  writeFileSync
} from 'fs';
import * as path from 'path';

export default function saveFile(filepath, contents) {
  const resolvedPath = path.resolve(filepath);

  // Create folders if they do not exist
  if (!existsSync(resolvedPath)) {
    createDirs(resolvedPath);
  }

  try {
    writeFileSync(resolvedPath, contents, 'utf8');
    return resolvedPath;

  } catch {
    return false;
  }
}

function createDirs(filepath) {
  const folderList = filepath
    .split(path.sep)
    .filter(dir => dir !== '')
    // Remove last item
    .reverse()
    .slice(1)
    .reverse();

  folderList
    .forEach((folder, index) => {
      const currentPath = '/' + folderList
        .slice(0, index)
        .concat([folder])
        .join(path.sep);

      if (!existsSync(currentPath)) {
        mkdirSync(currentPath);
      }
    });
}
