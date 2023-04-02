"use strict";

const os = require("os");
const fs = require("fs");
const path = require("path");

const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

class GitRepo {
  constructor({
    dir = path.join(os.tmpdir(), "source"),
    url,
    branch,
    credentials
  }) {
    this.dir = dir;
    this.url = url;
    this.branch = branch;
    this.credentials = credentials;
  }

  async clone() {
    await git.clone({
      fs,
      http,
      dir: this.dir,
      url: this.url,
      onAuth: () => this.credentials,
    });
  }

  async createFile(filepath, contents) {
    // TODO check for existing file?
    // TODO validate contents
    const parsedFilePath = path.parse(filepath);
    await fs.promises.mkdir(path.join(this.dir, parsedFilePath.dir), { recursive: true });
    await fs.promises.writeFile(path.join(this.dir, filepath), contents, "utf8");
    await git.add({ fs, dir: this.dir, filepath });
  }

  async deleteFile(filepath) {
    await fs.promises.rm(filepath, { recursive: true })
    await git.add({ fs, dir: this.dir, filepath });
  }

  async appendFile(filepath, contents) {
    // TODO check for existing file
    // This would require refactoring update recipe endpoint as it relies on this method's ability to overwrite files
    // TODO validate contents
    await fs.promises.appendFile(path.join(this.dir, filepath), contents, "utf8")
    await git.add({ fs, dir: this.dir, filepath });
  }

  async replaceFileContent(filepath, find, replace) {
    // TODO check for existing file
    // TODO validate contents
    const originalFileContents = await fs.promises.readFile(filepath)
    const updatedFileContents = originalFileContents.replace(find, replace);

    await fs.promises.writeFile(path.join(this.dir, filepath), updatedFileContents, "utf8");
    await git.add({ fs, dir: repoPath, filepath: filepath });
  }

  async checkout() {
    await git.checkout({
      fs,
      ref: this.branch
    })
  }

  async commit(message, author) {
    const hash = await git.commit({
      fs,
      dir: this.dir,
      author,
      message
    });
    return hash;
  }

  async push() {
    const result = await git.push({
      fs,
      http,
      dir: this.dir,
      remote: 'origin',
      ref: this.branch,
      onAuth: () => this.credentials,
    });
    return result;
  }

  async cleanup() {
    await fs.promises.rm(this.dir, {
      recursive: true
    });
  }
}

module.exports = { GitRepo };