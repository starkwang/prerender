module.exports = {
    rootPath: './dist',
    targets: [
        '/webserver/index.html',
        '/webserver/fans-list.html'
    ],
    mapResource: {
        '//s.url.cn/huayang/short-video/': '../cdn/'
    },

    // 把首屏 .container 的内容放到 #main 下
    prerenderContent: '.container',
    prerenderRootId: 'main'
}