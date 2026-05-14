const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // 托管静态文件（index.html/admin.html）

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data.json');

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// 接口：接收前端上传的数据
app.post('/api/data', (req, res) => {
  try {
    const newData = req.body;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    data.push({ ...newData, time: new Date().toLocaleString() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.status(200).json({ code: 0, msg: 'success' });
  } catch (err) {
    res.status(500).json({ code: 1, msg: err.message });
  }
});

// 接口：获取所有数据
app.get('/api/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ code: 1, msg: err.message });
  }
});

// 接口：清空所有数据
app.delete('/api/data', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    res.status(200).json({ code: 0, msg: 'cleared' });
  } catch (err) {
    res.status(500).json({ code: 1, msg: err.message });
  }
});

// 启动服务
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});