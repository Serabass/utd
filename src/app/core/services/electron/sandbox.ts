import fetch from "node-fetch";
import * as mkdirp from "mkdirp";
import * as c from "cheerio";
import * as path from "path";
import * as md5File from "md5-file";
import * as r from "request";
import rp from "request-progress";

(async () => {
  let dir = await Directory.at("/GameTypes/").fetch();
  console.log(dir);
})();
