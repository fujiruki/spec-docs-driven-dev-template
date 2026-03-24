import { watchFile, unwatchFile, type StatWatcher } from 'fs';

export interface FileWatcher {
  close(): void;
}

export function watchTaskFile(
  filePath: string,
  onChange: () => void,
): FileWatcher {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watchFile(filePath, { interval: 60000 }, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onChange, 100);
  });

  return {
    close() {
      unwatchFile(filePath);
      if (debounceTimer) clearTimeout(debounceTimer);
    },
  };
}
