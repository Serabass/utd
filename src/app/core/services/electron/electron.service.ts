import {EventEmitter, Injectable} from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import {ipcRenderer, remote, webFrame} from 'electron';
import * as childProcess from 'child_process';

function delay(interval: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, interval);
  });
}

export type EntrySize = {total: number, transferred: number};

export abstract class Entry {
  fs: any;
  cheerio: any;
  r: any;
  p: any;
  rp: any;
  mkdirp: any;
  md5File: any;

  public type: string;
  public size: EntrySize;
  public dateModified: string;
  public parentDir: Directory;

  public onProgress: EventEmitter<any> = new EventEmitter();

  public get isDir() {
    return this.type === "[dir]";
  }

  public constructor(public name: string) {
    this.fs = window.require('fs');
    this.p = window.require('path');
    this.cheerio = window.require('cheerio');
    this.r = window.require('request-promise');
    this.rp = window.require('request-progress');
    this.mkdirp = window.require('mkdirp');
    this.md5File = window.require('md5-file');
  }

  public get path() {
    if (!this.parentDir) {
      return this.name;
    }
    return this.p.join(this.parentDir.path, this.name);
  }

  public abstract download(): Promise<boolean>;
}

export class File extends Entry {
  public downloading = false;
  public md5Checked = false;
  public async getMD5(): Promise<string> {
    let dirPath = this.parentDir
      ? encodeURIComponent(this.parentDir.path)
      : "/";
    return await this.r(
      `http://unrealtournament.99.free.fr/utfiles/index.php?dir=${dirPath}&md5=${encodeURIComponent(
        this.name
      )}`,
      {
        mode: 'no-cors'
      },
    );
  }

  public get localPath() {
    let dirPath = this.parentDir ? this.parentDir.path : "/";

    return this.p.join(process.cwd(), "dl", dirPath, this.name);
  }

  public get url() {
    let dirPath = this.parentDir
      ? encodeURIComponent(this.parentDir.path)
      : "/";

    return `http://unrealtournament.99.free.fr/utfiles/index.php?dir=${dirPath}&file=${encodeURIComponent(
      this.name
    )}`;
  }

  public async checkMD5(): Promise<boolean> {
    const dirPath = this.p.dirname(this.localPath);
    if (!this.fs.existsSync(dirPath)) {
      return false;
    }
    if (!this.fs.existsSync(this.localPath)) {
      return false;
    }
    let remoteMD5 = await this.getMD5();
    let localMD5 = await this.md5File(this.localPath);
    return remoteMD5 === localMD5;
  }

  public async download(): Promise<boolean> {
    const dirPath = this.p.dirname(this.localPath);

    if (!this.fs.existsSync(dirPath)) {
      await this.mkdirp(dirPath);
    }

    if (this.fs.existsSync(this.localPath)) {
      let remoteMD5 = await this.getMD5();
      let localMD5 = await this.md5File(this.localPath);

      if (remoteMD5 === localMD5) {
        return false;
      }
    }

    this.downloading = true;
    await delay(1000);

    return new Promise<boolean>((resolve, reject) => {
      // let spinner = ora(`Downloading ${this.path}`).start();
      this.rp(this.r(this.url))
        .on("progress", (state) => {
          this.downloading = true;
          this.size = state.size;
          this.onProgress.emit(this.size);
        })
        .on("error", (err) => {
          // spinner.stop();
          this.downloading = false;
          console.error(err);
          reject(err);
        })
        .on("end", () => {
          // spinner.stop();
          this.downloading = false;
          resolve(true);
        })
        .pipe(this.fs.createWriteStream(this.localPath));
    });
  }
}

export class Directory extends Entry {
  public fileCount: number;

  public children: Entry[] = [];

  public static at(path: string) {
    return new Directory(path);
  }

  public get url() {
    return `http://unrealtournament.99.free.fr/utfiles/index.php?dir=${encodeURIComponent(
      this.path
    )}`;
  }

  public async download() {
    for (let ch of this.children) {
      if (!ch.isDir) {
        await ch.download();
      }
    }

    return true;
  }

  public async fetchCached(url: string) {
    let result;
    if (!localStorage.getItem(url)) {
      result = await this.r(this.url);
      localStorage.setItem(url, result);
    } else {
      result = localStorage.getItem(url);
    }
    return result;
  }

  public async fetch() {
    let html = await this.fetchCached(this.url);
    let $ = this.cheerio.load(html);
    let table = $("body > table:eq(0)");
    let rows = table.find("tr.dark_row, tr.light_row").toArray();

    for (let row of rows) {
      let $tr = this.cheerio(row);
      let type = $tr.find("td img[alt]").attr("alt");
      let name = $tr.find("td:eq(0) a:first").text().trim();
      let sizeStr = $tr.find("td:eq(1) a").attr("title");
      let dateModified = $tr.find("td:eq(2) a").attr("title");
      if (name === "Parent Directory") {
        continue;
      }
      let [, size] = sizeStr.match(/^.+?\n([\d,]+)\s+bytes\s+\(.+?\)$/);
      let sizeVal = parseInt(size.replace(/,/g, ""));

      if (type === "[dir]") {
        let tdText = $tr.find("td:eq(0)").text();
        let m = tdText.match(/\[(\d+) Files?\]$/);
        let [, fileCount] = m;
        let dir = new Directory(name.trim());
        dir.fileCount = parseInt(fileCount);
        dir.size = {total: sizeVal, transferred: 0};
        dir.dateModified = dateModified;
        dir.parentDir = this;
        dir.type = type;
        // await dir.fetch();
        this.children.push(dir);
      } else {
        let m = name.match(/^(.+?)(?:\s*\[get md5sum\])?$/);
        if (!m) {
          throw new Error(`Match error: ${name}`);
        }

        let [, filename] = m;
        let file = new File(filename.trim());
        file.size = {total: sizeVal, transferred: 0};
        file.dateModified = dateModified;
        file.parentDir = this;
        file.type = type;
        // await file.download();
        this.children.push(file);
      }
    }

    return this;
  }
}


@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: any;
  cheerio: any;
  r: any;
  p: any;
  rp: any;
  mkdirp: any;
  md5File: any;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      // If you wan to use remote object, pleanse set enableRemoteModule to true in main.ts
      // this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.p = window.require('path');
      this.cheerio = window.require('cheerio');
      this.r = window.require('request-promise');
      this.rp = window.require('request-progress');
      this.mkdirp = window.require('mkdirp');
      this.md5File = window.require('md5-file');
    }
  }

  public load(p: string) {
    return Directory.at('/GameTypes/UT2004Extreme/').fetch();
  }
}

