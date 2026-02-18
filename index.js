export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Get the target URL from query parameter 'url' or 'b23'
    const targetUrl = url.searchParams.get("url") || url.searchParams.get("b23");

    // If no URL parameter is provided, serve the HTML frontend
    if (!targetUrl) {
      const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>哔哩哔哩短链转长链工具</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f0f2f5;
            color: #333;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #00a1d6;
            text-align: center;
            margin-bottom: 30px;
        }
        .input-group {
            margin-bottom: 20px;
        }
        input[type="text"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e4e8;
            border-radius: 6px;
            font-size: 16px;
            box-sizing: border-box;
            transition: border-color 0.3s;
        }
        input[type="text"]:focus {
            border-color: #00a1d6;
            outline: none;
        }
        button {
            width: 100%;
            padding: 12px;
            background-color: #00a1d6;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #00b5e5;
        }
        #result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 6px;
            background-color: #f8f9fa;
            display: none;
        }
        .result-item {
            margin-bottom: 10px;
            word-break: break-all;
        }
        .label {
            font-weight: bold;
            color: #666;
            font-size: 0.9em;
        }
        .error {
            color: #d93025;
            background-color: #fce8e6;
            padding: 10px;
            border-radius: 4px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Bilibili 短链转长链</h1>
        <div class="input-group">
            <input type="text" id="shortUrl" placeholder="请输入 b23.tv 短链接 (例如: https://b23.tv/xxxxxx)" />
        </div>
        <button onclick="convert()">转换</button>
        
        <div id="error" class="error"></div>
        
        <div id="result">
            <div class="result-item">
                <div class="label">原始链接:</div>
                <div id="originalUrl"></div>
            </div>
            <div class="result-item">
                <div class="label">完整链接 (包含参数):</div>
                <a id="fullUrl" href="#" target="_blank"></a>
            </div>
            <div class="result-item">
                <div class="label">纯净链接 (推荐):</div>
                <a id="cleanUrl" href="#" target="_blank" style="color: #00a1d6; font-weight: bold;"></a>
            </div>
        </div>
    </div>

    <script>
        async function convert() {
            const input = document.getElementById('shortUrl');
            const resultDiv = document.getElementById('result');
            const errorDiv = document.getElementById('error');
            const url = input.value.trim();

            if (!url) {
                showError('请输入链接');
                return;
            }

            // Simple validation
            if (!url.includes('b23.tv') && !url.includes('bilibili.com')) {
                showError('请输入有效的 Bilibili 链接');
                return;
            }

            errorDiv.style.display = 'none';
            resultDiv.style.display = 'none';

            try {
                // Call the worker API
                const response = await fetch(\`/?url=\${encodeURIComponent(url)}\`);
                const data = await response.json();

                if (data.error) {
                    showError(data.error);
                } else {
                    document.getElementById('originalUrl').textContent = data.original;
                    
                    const fullLink = document.getElementById('fullUrl');
                    fullLink.href = data.final;
                    fullLink.textContent = data.final;
                    
                    const cleanLink = document.getElementById('cleanUrl');
                    cleanLink.href = data.clean;
                    cleanLink.textContent = data.clean;
                    
                    resultDiv.style.display = 'block';
                }
            } catch (err) {
                showError('转换失败，请检查网络或稍后重试');
                console.error(err);
            }
        }

        function showError(msg) {
            const errorDiv = document.getElementById('error');
            errorDiv.textContent = msg;
            errorDiv.style.display = 'block';
        }
    </script>
</body>
</html>
      `;
      return new Response(html, {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
        },
      });
    }

    try {
      // Fetch the short link with a desktop User-Agent to ensure we get the www.bilibili.com link
      // and not the mobile m.bilibili.com link
      const response = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });

      const finalUrl = response.url;
      
      // Regex to extract the clean video URL
      // Matches https://www.bilibili.com/video/BV... or av...
      // The user wants specifically: https://www.bilibili.com/video/XXXXXxxxxxxXXXXX
      // And mentioned extracting from query params like ?-Arouter=...
      
      // Pattern: https://www.bilibili.com/video/[alphanumeric]
      const regex = /https?:\/\/(?:www\.)?bilibili\.com\/video\/[A-Za-z0-9]+/i;
      const match = finalUrl.match(regex);

      if (match) {
        const cleanUrl = match[0];
        return new Response(JSON.stringify({
          original: targetUrl,
          final: finalUrl,
          clean: cleanUrl
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } else {
        // Fallback if regex doesn't match (e.g. redirected to login or homepage)
        return new Response(JSON.stringify({
          original: targetUrl,
          final: finalUrl,
          error: "Could not extract video ID from the resolved URL. It might not be a video link."
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

    } catch (error) {
      return new Response(JSON.stringify({
        error: `Error fetching URL: ${error.message}`
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        },
      });
    }
  },
};
