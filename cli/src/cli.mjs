#!/usr/bin/env node

import { doctorProject, formatDoctorText } from './doctor.mjs';

function usage() {
  return [
    'Usage:',
    '  sddd doctor [PROJECT_PATH] [--format text|json]',
    '',
    'The doctor command is read-only and performs structural checks only.',
  ].join('\n');
}

function parseDoctorArgs(args) {
  let projectPath = process.cwd();
  let format = 'text';
  let projectSeen = false;

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === '--format') {
      format = args[index + 1];
      index += 1;
      continue;
    }
    if (value.startsWith('--format=')) {
      format = value.slice('--format='.length);
      continue;
    }
    if (value.startsWith('-')) throw new Error(`Unknown option: ${value}`);
    if (projectSeen) throw new Error(`Unexpected argument: ${value}`);
    projectPath = value;
    projectSeen = true;
  }

  if (!['text', 'json'].includes(format)) throw new Error(`Unknown format: ${format}`);
  return { projectPath, format };
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || ['-h', '--help', 'help'].includes(command)) {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }
  if (command !== 'doctor') {
    process.stderr.write(`Unknown command: ${command}\n\n${usage()}\n`);
    return 2;
  }

  try {
    const { projectPath, format } = parseDoctorArgs(args);
    const result = doctorProject(projectPath);
    const output = format === 'json' ? JSON.stringify(result, null, 2) : formatDoctorText(result);
    process.stdout.write(`${output}\n`);
    return result.status === 'pass' ? 0 : 1;
  } catch (error) {
    process.stderr.write(`${error.message}\n\n${usage()}\n`);
    return 2;
  }
}

process.exitCode = main();
