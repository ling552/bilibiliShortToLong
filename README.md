# bilibiliShortToLong

## 简单的将哔哩哔哩短链接转为长链接后端

- **GET请求**
http://localhost:5051/api/short2long?url=https://b23.tv/xxxxxx

- **POST请求**
http://localhost:5051/api/short2lon

请求Body
```JavaScript
{
  "url": "https://b23.tv/xxxxxx"
}
```
---
返回
```JavaScript
{
  code: 200,
  msg: 'success',
  data: {
    shortUrl: ' https://b23.tv/xxxxxx',
    longUrl: 'https://www.bilibili.com/video/XXXXXxxxxxxXXXXX??-Arouter=story&buvid=XXXxxxXXxXXXxxxXXxXxXXx'
  }
}
```
