const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express(); // サーバーのインスタンス生成

// 静的ファイルの提供: 'public' ディレクトリ内のファイルを提供
app.use(express.static(path.join(__dirname, "public")));

// JSONファイルからパスを読み込む関数
function loadPaths() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'path-list.json'), 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (parseErr) {
          reject(parseErr);
        }
      }
    });
  });
}

// 動的に URL をマッピングしてリクエストに対応
async function setupRoutes() {
  try {
    const config = await loadPaths();
    const { HtmlFileAria, urls } = config;

    // urls 配列の各要素に対してルートを作成
    urls.forEach(({ url, path }) => {
      const fullPath = path.join(HtmlFileAria, path); // 'public' フォルダとファイルパスを結合
      app.get(url, (req, res) => {
        res.sendFile(path.resolve(__dirname, fullPath)); // 絶対パスを指定してファイルを返す
      });
    });

  } catch (err) {
    console.error('Error setting up routes:', err);
  }
}

// 404 エラーハンドリング: ルートが見つからない場合に 404.html を返す
app.use((req, res, next) => {
  res.status(404).sendFile(path.resolve(__dirname, 'public/404.html'));
});

// サーバーの設定
setupRoutes();

// サーバーの起動
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
