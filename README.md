# prerender
A tool for prerendering in your html assets

# Usage
```
npm i prerendering
```

然后写一个配置文件 `prerender.config.js`：

```js
module.exports = {
    // 根文件夹
    rootPath: './dist',
    
    // 要预渲染的 html 文件
    targets: [
        '/webserver/index.html',
        '/webserver/fans-list.html'
    ],
    
    // 把 url 映射为本地的相对路径（相对于html文件）
    mapResource: {
        '//s.url.cn/huayang/short-video/': '../cdn/'
    },

    // 把首屏 .container 的内容放到 #main 下
    prerenderContent: '.container',
    prerenderRootId: 'main'
}
```

然后执行即可（不填 config 参数也行，会默认使用当前路径下的 `prerender.config.js`）
```
./node_modules/.bin/prerendering --config=prerender.config.js
```
