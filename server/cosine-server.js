const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 4004;

const cosineImgFolderPath = path.join(__dirname, 'public', 'uploads');
app.use(cors());

const corsOptions = {
  origin: 'http://localhost:3000', // 클라이언트 도메인을 여기에 명시
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

// 동적으로 하위 폴더들의 이름을 읽어와서 라우트 설정
fs.readdir(cosineImgFolderPath, (err, subfolders) => {
  if (err) {
    console.error('Error reading subfolders:', err);
    return;
  }

  subfolders.forEach(subfolder => {
    const subfolderPath = path.join(cosineImgFolderPath, subfolder);
    app.use(`/${subfolder}`, cors(corsOptions), express.static(subfolderPath));

    app.get(`/api/${subfolder}`, (req, res) => {
      fs.readdir(subfolderPath, (err, files) => {
        if (err) {
          console.error('Error reading image folder:', err);
          res.status(500).send('Internal Server Error');
          return;
        }

        const imagePaths = files
          .filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i))
          .map(file => `/${subfolder}/${file}`);
        res.json(imagePaths);
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
