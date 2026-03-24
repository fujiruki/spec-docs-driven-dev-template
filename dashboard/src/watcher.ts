import { watchFile, unwatchFile, type StatWatcher } from 'fs';

export interface FileWatcher {
  close(): void;
}

export function watchTaskFile(
  filePath: string,
  onChange: () => void,
): FileWatcher {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watchFile(filePath, { interval: 5000 }, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onChange, 100);
  });

  const autoRefresh = setInterval(onChange, 60000);

  return {
    close() {
      unwatchFile(filePath);
      clearInterval(autoRefresh);
      if (debounceTimer) clearTimeout(debounceTimer);
    },
  };
}
