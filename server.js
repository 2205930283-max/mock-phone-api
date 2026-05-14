const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// 初始化 Express 应用
const app = express();
// Render 会自动注入 PORT 环境变量，默认使用 10000 端口
const PORT = process.env.PORT || 10000;

// 中间件配置
app.use(cors()); // 解决跨域问题，前端可以正常调用
app.use(express.json()); // 解析 JSON 格式请求体
app.use(express.static(__dirname)); // 托管静态文件（index.html、admin.html 等）

// 数据文件路径（存储采集到的信息）
const DATA_FILE = path.join(__dirname, 'data.json');

// 初始化数据文件（如果不存在则创建）
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// 接口1：接收前端上传的数据（POST 请求）
app.post('/api/data', (req, res) => {
  try {
    // 获取前端发送的数据
    const newData = req.body;
    // 读取现有数据
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    // 添加时间戳，存入数据
    data.push({
      ...newData,
      uploadTime: new Date().toLocaleString() // 记录上传时间
    });
    // 写入文件保存
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    // 返回成功响应
    res.status(200).json({ code: 0, message: '数据上传成功' });
  } catch (err) {
    console.error('数据上传失败:', err);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
});

// 接口2：获取所有采集数据（GET 请求）
app.get('/api/data', (req, res) => {
  try {
    // 读取所有数据
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    // 返回数据
    res.status(200).json(data);
  } catch (err) {
    console.error('数据获取失败:', err);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
});

// 接口3：清空所有数据（DELETE 请求）
app.delete('/api/data', (req, res) => {
  try {
    // 清空数据文件
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    // 返回成功响应
    res.status(200).json({ code: 0, message: '数据已清空' });
  } catch (err) {
    console.error('数据清空失败:', err);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
});

// 启动服务（关键：必须监听 0.0.0.0，Render 才能正常访问）
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务器已启动，监听端口: ${PORT}`);
});