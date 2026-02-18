const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = 80;

// 同时支持 GET 和 POST
app.all('/api/short2long', async (req, res) => {
  try {
    // 自动从 GET 或 POST 取 url 参数
    const shortUrl = req.query.url || req.body.url;

    if (!shortUrl) {
      return res.status(400).json({
        code: 400,
        msg: '缺少 url 参数',
      });
    }

    const response = await axios.head(shortUrl, {
      maxRedirects: 0,
      validateStatus: status => status >= 300 && status < 400,
    });

    const longUrl = response.headers.location;

    return res.json({
      code: 200,
      msg: 'success',
      data: {
        shortUrl,
        longUrl,
      },
    });

  } catch (err) {
    return res.status(500).json({
      code: 500,
      msg: '解析失败',
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`服务已启动：http://localhost:${PORT}`);

});
