import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';

const REQUIRED_PATHS = [
  ['SDDD.md', 'file'],
  ['AGENTS.md', 'file'],
  ['docs/SPEC.md', 'file'],
  ['docs/requests.md', 'file'],
  ['task.md', 'file'],
  ['docs/spec', 'directory'],
];

const ALLOWED_STATUSES = new Set([
  '仕様化済み',
  '実装中',
  '検証中',
  '完了',
  '保留',
  '見送り',
  '取り下げ',
  '他要望へ統合',
]);

const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.sddd',
  '.codegraph',
  'node_modules',
  'dist',
  'build',
]);

function portablePath(root, path) {
  const value = relative(root, path).replaceAll('\\', '/');
  return value || '.';
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function withoutFencedCode(text) {
  const lines = text.split('\n');
  let fenced = false;
  return lines
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return '';
      }
      return fenced ? '' : line;
    })
    .join('\n');
}

function collectMarkdownFiles(root) {
  const files = [];

  function visit(directory) {
    const entries = readdirSync(directory, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;

      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile() && extname(entry.name).toLowerCase() === '.md') files.push(path);
    }
  }

  visit(root);
  return files;
}

function diagnostic(ruleId, severity, file, line, message) {
  return { ruleId, severity, file, line, message };
}

function checkRequiredPaths(root, diagnostics) {
  for (const [relativePath, expectedType] of REQUIRED_PATHS) {
    const path = join(root, relativePath);
    const valid = existsSync(path)
      && (expectedType === 'file' ? lstatSync(path).isFile() : lstatSync(path).isDirectory());
    if (!valid) {
      diagnostics.push(diagnostic(
        'SDDD001',
        'error',
        relativePath,
        1,
        `Required ${expectedType} is missing: ${relativePath}`,
      ));
    }
  }

  const currentLedger = join(root, 'docs/requests_log.md');
  const legacyLedger = join(root, 'docs/request_log.md');
  if (!existsSync(currentLedger)) {
    if (existsSync(legacyLedger)) {
      diagnostics.push(diagnostic(
        'SDDD002',
        'warning',
        'docs/request_log.md',
        1,
        'Legacy request ledger detected; migrate deliberately to docs/requests_log.md without rewriting history.',
      ));
    } else {
      diagnostics.push(diagnostic(
        'SDDD001',
        'error',
        'docs/requests_log.md',
        1,
        'Required file is missing: docs/requests_log.md',
      ));
    }
  }
}

function localLinkTarget(rawTarget) {
  const trimmed = rawTarget.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;

  const angle = trimmed.match(/^<([^>]+)>/);
  const firstPart = angle ? angle[1] : trimmed.split(/\s+/)[0];
  const pathPart = firstPart.split('#')[0].split('?')[0];
  if (!pathPart) return null;

  try {
    return decodeURIComponent(pathPart);
  } catch {
    return pathPart;
  }
}

function checkLinks(root, markdownFiles, diagnostics) {
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;

  for (const path of markdownFiles) {
    const text = withoutFencedCode(readFileSync(path, 'utf8'));
    for (const match of text.matchAll(linkPattern)) {
      const target = localLinkTarget(match[1]);
      if (!target) continue;

      const resolvedTarget = isAbsolute(target) ? resolve(target) : resolve(dirname(path), target);
      if (!existsSync(resolvedTarget)) {
        diagnostics.push(diagnostic(
          'SDDD101',
          'error',
          portablePath(root, path),
          lineNumberAt(text, match.index),
          `Broken local link: ${target}`,
        ));
      }
    }
  }
}

function checkRequestIds(root, markdownFiles, diagnostics) {
  const idPattern = /\bR-\d+\b/g;

  for (const path of markdownFiles) {
    const text = withoutFencedCode(readFileSync(path, 'utf8'));
    for (const match of text.matchAll(idPattern)) {
      if (!/^R-\d{4}$/.test(match[0])) {
        diagnostics.push(diagnostic(
          'SDDD201',
          'error',
          portablePath(root, path),
          lineNumberAt(text, match.index),
          `Invalid request ID format: ${match[0]}; expected R-0001.`,
        ));
      }
    }
  }
}

function ledgerFiles(root, markdownFiles) {
  return markdownFiles.filter((path) => {
    const portable = portablePath(root, path);
    return portable === 'docs/requests_log.md'
      || portable === 'docs/request_log.md'
      || portable.startsWith('docs/requests_log/');
  });
}

function checkLedgerEntries(root, markdownFiles, diagnostics) {
  const seen = new Map();
  const headingPattern = /^#{2,6}\s+(R-\d+)\s*(?:[—–-]\s*(.+?))?\s*$/gm;

  for (const path of ledgerFiles(root, markdownFiles)) {
    const text = withoutFencedCode(readFileSync(path, 'utf8'));
    for (const match of text.matchAll(headingPattern)) {
      const file = portablePath(root, path);
      const line = lineNumberAt(text, match.index);
      const id = match[1];
      const status = match[2]?.trim();

      if (/^R-\d{4}$/.test(id)) {
        if (seen.has(id)) {
          const first = seen.get(id);
          diagnostics.push(diagnostic(
            'SDDD202',
            'error',
            file,
            line,
            `Duplicate ledger entry for ${id}; first entry is ${first.file}:${first.line}.`,
          ));
        } else {
          seen.set(id, { file, line });
        }
      }

      if (status && !ALLOWED_STATUSES.has(status)) {
        diagnostics.push(diagnostic(
          'SDDD301',
          'error',
          file,
          line,
          `Unknown request status: ${status}`,
        ));
      }
    }
  }
}

function sortDiagnostics(diagnostics) {
  const severityOrder = { error: 0, warning: 1 };
  diagnostics.sort((a, b) => (
    severityOrder[a.severity] - severityOrder[b.severity]
    || a.file.localeCompare(b.file)
    || a.line - b.line
    || a.ruleId.localeCompare(b.ruleId)
    || a.message.localeCompare(b.message)
  ));
}

export function doctorProject(projectPath) {
  const root = resolve(projectPath);
  if (!existsSync(root) || !lstatSync(root).isDirectory()) {
    const error = new Error(`Project path does not exist or is not a directory: ${root}`);
    error.code = 'INVALID_PROJECT';
    throw error;
  }

  const diagnostics = [];
  checkRequiredPaths(root, diagnostics);
  const markdownFiles = collectMarkdownFiles(root);
  checkLinks(root, markdownFiles, diagnostics);
  checkRequestIds(root, markdownFiles, diagnostics);
  checkLedgerEntries(root, markdownFiles, diagnostics);
  sortDiagnostics(diagnostics);

  const errors = diagnostics.filter((item) => item.severity === 'error').length;
  const warnings = diagnostics.filter((item) => item.severity === 'warning').length;

  return {
    schemaVersion: '1',
    root,
    status: errors === 0 ? 'pass' : 'fail',
    summary: { errors, warnings },
    diagnostics,
    disclaimer: 'STRUCTURE PASS does not mean the implementation, tests, security, or specification semantics were verified.',
  };
}

export function formatDoctorText(result) {
  const lines = [
    `SdDD doctor: STRUCTURE ${result.status.toUpperCase()}`,
    `Project: ${result.root}`,
    `Errors: ${result.summary.errors}  Warnings: ${result.summary.warnings}`,
  ];

  for (const item of result.diagnostics) {
    lines.push(`${item.severity.toUpperCase()} ${item.ruleId} ${item.file}:${item.line} ${item.message}`);
  }

  lines.push('', result.disclaimer);
  return lines.join('\n');
}
