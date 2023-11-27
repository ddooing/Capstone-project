const express = require('express');
//const qs = require('querystring');
const cors = require('cors');
//const cookie = require('cookie'); // 추가된 부분
const connection = require('./DB_Connect'); 

const app = express();
const port = 4003;


app.use(cors());
app.use(express.json()); // JSON 요청 바디를 파싱하기 위해 추가


app.post('/api/profiles/:id', (req, res) => {
  const id = req.params.id; // 클라이언트에서 받아온 게시글의 id

  // your_post 테이블에서 postId에 해당하는 이메일을 찾습니다.
  const findEmailQuery = `SELECT email FROM your_post WHERE id = ?`;
  connection.query(findEmailQuery, [id], (err, result) => {
    if (err) {
      console.error('Error finding email:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }

    if (result.length === 0) {
      console.log('Post not found for ID:', id);
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const userEmail = result[0].email;
    console.log('Found email:', userEmail);

    // 클라이언트에게 userEmail을 응답으로 보냅니다.
    res.json({ userEmail: userEmail });
  });
});


app.get('/api/profile/:emailId', (req, res) => {
  const emailId = req.params.emailId;
  const page = parseInt(req.query.page, 10) || 1; // 현재 페이지
  const postsPerPage = parseInt(req.query.postsPerPage, 10) || 20;
 // 페이지 당 게시물 수

  const limit = postsPerPage;
  
  console.log('Received id:', emailId);
  console.log('page: ', page);

   // 총 이미지 개수
    const totalCountQuery = `SELECT COUNT(*) as total FROM your_post WHERE email LIKE ?`;
    connection.query(totalCountQuery, [`${emailId}@%`], (err, totalCountData) => {
      if (err) {
        console.error('총 이미지 개수를 가져오는 중 에러 발생:', err);
        res.status(500).json({ error: '데이터베이스 오류' });
        return;
      }
      const totalCount = totalCountData[0].total;
      const offset = (page - 1) * postsPerPage;
      console.log('total : ', totalCount);
      console.log('offset: ', offset);
  

  // 게시글 이미지와 id
  const findImagesQuery = `SELECT id, image_url FROM your_post WHERE email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  connection.query(findImagesQuery, [`${emailId}@%`, limit, offset], (err, images) => {
    if (err) {
      console.error('이미지를 가져오는 중 에러 발생:', err);
      res.status(500).json({ error: '데이터베이스 오류' });
      return;
    }

   

      // 프로필 정보
      const findUserQuery = `SELECT nickname, email FROM users WHERE email LIKE ?`;
      connection.query(findUserQuery, [`${emailId}@%`], (err, userData) => {
        if (err) {
          console.error('사용자 데이터를 가져오는 중 에러 발생:', err);
          res.status(500).json({ error: '데이터베이스 오류' });
          return;
        }

        if (userData.length === 0) {
          res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
          return;
        }

        const { nickname, email} = userData[0];

        // Fetch user ID
        const findUserIdQuery = `SELECT id FROM users WHERE email LIKE ? `;
        connection.query(findUserIdQuery, [`${emailId}@%`], (err, result) => {
          if (err) {
            console.error('사용자 ID를 가져오는 중 에러 발생:', err);
            res.status(500).json({ error: '데이터베이스 오류' });
            return;
          }

          if (result.length === 0) {
            res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
            return;
          }

          const userId = result[0].id;

          // Fetch profile data (introduction and career)
          const findProfileQuery = `SELECT introduction, career, insta FROM profiles WHERE user_id = ?`;
          connection.query(findProfileQuery, [userId], (err, profileData) => {
            if (err) {
              console.error('프로필 데이터를 가져오는 중 에러 발생:', err);
              res.status(500).json({ error: '데이터베이스 오류' });
              return;
            }

            if (profileData.length === 0) {
              res.status(404).json({ error: '프로필을 찾을 수 없습니다' });
              return;
            }

            const profile = profileData[0];

            // 모든 데이터
            res.json({
              id: images.map(image => image.id),
              images: images.map(image => image.image_url),
              nickname,
              email,
              introduction: profile.introduction,
              career: profile.career,
              insta:profile.insta,
              totalCount
            });
          });
        });
      });
    });
  });
});



app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });