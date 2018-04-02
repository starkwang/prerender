const express = require("express");
const fs = require("fs");
const path = require("path");
const copy = require("recursive-copy");
const replaceString = require("replace-string");
const del = require("del");
const phantom = require("phantom");

const dom = require("./dom");

async function copyDir(src, dest) {
  return new Promise((resolve, reject) => {
    copy(src, dest, function(error, results) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}
//const config = require('./config');

async function generate(configPath = "./prerender.config.js") {
  const config = require(path.resolve(configPath));
  await copyDir(config.rootPath, ".prerender");

  config.targets.forEach(target => {
    var content = fs.readFileSync(".prerender" + target, "utf-8");

    for (const key in config.mapResource) {
      content = replaceString(content, key, config.mapResource[key]);
    }

    fs.writeFileSync(".prerender" + target, content);
  });

  const app = express();
  app.use(express.static(".prerender"));
  var server = app.listen(13131, function() {
    var host = server.address().address;
    var port = server.address().port;
  });

  const instance = await phantom.create();
  try {
    for (let i = 0; i < config.targets.length; i++) {
      const target = config.targets[i];
      // 打开新页面
      const page = await instance.createPage();
      await page.property("viewportSize", {
        width: 800,
        height: 600,
        ...config.viewport
      });
      console.log("Fetching:", target);
      await page.open("http://localhost:13131/" + target);

      // container
      console.log("Query container node");
      const containerNode = await page.evaluate(function(selector) {
        return document.querySelector(selector).outerHTML;
      }, config.prerenderContent);
      console.log("Query container node success");

      // style
      console.log("Query style nodes");
      const styleNodes = await page.evaluate(function() {
        const results = [];
        const nodes = document.querySelectorAll("style");
        for (var i = 0; i < nodes.length; i++) {
          results.push(nodes[i].outerHTML);
        }
        return results;
      });
      console.log("Query style nodes success");

      // 写入 html
      var html = fs.readFileSync(config.rootPath + target, "utf-8");
      html = dom.injectRoot(html, containerNode, config.prerenderRootId);

      html = dom.injectStyles(html, styleNodes);
      console.log(styleNodes);
      console.log("Writing to html file:", config.rootPath + target);
      fs.writeFileSync(config.rootPath + target, html);

      // 关闭页面
    }
  } catch (e) {
    console.log(e);
  }
  await instance.exit();

  del.sync([".prerender/**"]);
  process.exit();
}

function log(...args) {
  console.log(...args);
}

module.exports = generate;
