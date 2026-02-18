# bilibiliShortToLong

## 简单的将哔哩哔哩短链接转为长链接后端

- 使用**npm install**构建
- 使用**npm run dev**运行

- 若是本地运行测试，打开终端输出的链接即可

- 可项目支持API
  - 使用GET请求
```txt
http://link.com?url=https://b23.tv/XXXXXXXX
```

### 返回数据
```JavaScript
{
  original: 'https://b23.tv/XXXXXXXX',
  final: 'https://www.bilibili.com/video/xXXXXXxxxX/?-Arouter=story&buvid=xxXXXxxxx&from_spmid=tm.recommend.0.0&is_story_h5=true&mid=SuI1TBUZ6z3%2FLiAoO12EXQ%3D%3D&p=1&plat_id=&=ugc&=android&share_plat=android&share_session_id=&share_tag=&spmid=-video-detail-vertical.0.0&timestamp=&unique_k=&up_id=',
  clean: 'https://www.bilibili.com/video/xXXXXXxxxX'
}
```
### 使用Cloudflare Workers
fork本项目
打开cloudflare并打开**Workers 和 Pages**界面，新建Works，使用Continue with Github，登录Github同时选择本项目fork。
