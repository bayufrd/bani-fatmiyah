#!/usr/bin/env node

/**
 * Compatibility shim for environments where fs.readlink on regular files
 * returns EISDIR (observed on some Windows setups), while webpack expects
 * EINVAL for "not a symlink" conditions.
 */
const fs = require('fs');
const fsPromises = require('fs/promises');

const normalizeReadlinkError = (error) => {
  if (!error || error.code !== 'EISDIR') {
    return error;
  }

  const normalizedError = new Error(error.message.replace(/^EISDIR/, 'EINVAL'));
  normalizedError.code = 'EINVAL';
  normalizedError.errno = error.errno;
  normalizedError.path = error.path;
  normalizedError.syscall = error.syscall;
  return normalizedError;
};

const originalReadlink = fs.readlink.bind(fs);
const originalReadlinkSync = fs.readlinkSync.bind(fs);
const originalPromisesReadlink = fs.promises.readlink.bind(fs.promises);
const originalFsPromisesReadlink = fsPromises.readlink.bind(fsPromises);

fs.readlink = (path, options, callback) => {
  const resolvedOptions = typeof options === 'function' ? undefined : options;
  const resolvedCallback = typeof options === 'function' ? options : callback;

  return originalReadlink(path, resolvedOptions, (error, linkString) => {
    if (error) {
      resolvedCallback(normalizeReadlinkError(error));
      return;
    }

    resolvedCallback(null, linkString);
  });
};

fs.readlinkSync = (path, options) => {
  try {
    return originalReadlinkSync(path, options);
  } catch (error) {
    throw normalizeReadlinkError(error);
  }
};

fs.promises.readlink = async (path, options) => {
  try {
    return await originalPromisesReadlink(path, options);
  } catch (error) {
    throw normalizeReadlinkError(error);
  }
};

fsPromises.readlink = async (path, options) => {
  try {
    return await originalFsPromisesReadlink(path, options);
  } catch (error) {
    throw normalizeReadlinkError(error);
  }
};

require('next/dist/bin/next');
