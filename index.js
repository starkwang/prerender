const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');
const path = require('path')
const copy = require('recursive-copy');
const replaceString = require('replace-string');
const del = require('del');

const dom = require('./dom')

async function copyDir(src, dest) {
  return new Promise((resolve, reject) => {
    copy(src, dest, function (error, results) {
      if (error) {
        reject(error)
      } else {
        resolve(results)
      }
    })
  })
}
//const config = require('./config');


async function generate(configPath = './prerender.config.js') {
  const config = require(path.resolve(configPath))
  await copyDir(config.rootPath, '.prerender')

  config.targets.forEach(target => {
    var content = fs.readFileSync('.prerender' + target, 'utf-8')

    for (const key in config.mapResource) {
      content = replaceString(content, key, config.mapResource[key])
    }

    fs.writeFileSync('.prerender' + target, content)
  })


  const app = express();
  app.use(express.static('.prerender'));
  var server = app.listen(13131, function () {
    var host = server.address().address;
    var port = server.address().port;
  });

  const browser = await puppeteer.launch();

  await Promise.all(config.targets.map(async (target) => {
    // 打开新页面
    const page = await browser.newPage();
    await page.goto('http://localhost:13131/' + target, {
      waitUntil: 'domcontentloaded'
    });

    // container
    const container = await page.$(config.prerenderContent);
    const containerNode = await page.evaluate(container => container.outerHTML, container)

    // style
    const styles = await page.$$('style');
    const styleNodes = await Promise.all(styles.map(async style => {
      return await page.evaluate(style => style.outerHTML, style)
    }))
    // console.log(styleNodes, '\n\n')


    // 写入 html
    var html = fs.readFileSync(config.rootPath + target, 'utf-8')
    html = dom.injectRoot(html, containerNode, config.prerenderRootId);

    html = dom.injectStyles(html, styleNodes)
    // console.log(html)
    fs.writeFileSync(config.rootPath + target, html)

    // 关闭页面
    await page.close();
  }))

  await Promise.all(config.targets)

  await browser.close();
  del.sync(['.prerender/**']);
  process.exit();
}

function test(...args) {
  console.log(...args)
}

module.exports = generate