import { watch, type FSWatcher } from 'fs';

export function watchTaskFile(
  filePath: string,
  onChange: () => void,
): FSWatcher {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const watcher = watch(filePath, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onChange, 100);
  });

  return watcher;
}
