// api/posts.js

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    const usersPath = path.join(__dirname, '../users.json');
    const postsPath = path.join(__dirname, '../posts.json');
    const onlineUsersPath = path.join(__dirname, '../online-users.json');

    if (req.method === 'GET') {
        // Получение всех постов
        let posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
        res.status(200).json(posts);
    }
    else if (req.method === 'POST') {
        // Создание нового поста
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Неавторизован.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        let onlineUsers = JSON.parse(fs.readFileSync(onlineUsersPath, 'utf8'));
        const user = onlineUsers.find(user => user.token === token);
        if (!user) {
            res.status(401).json({ message: 'Неверный токен.' });
            return;
        }

        const { content, image } = req.body;
        if (!content && !image) {
            res.status(400).json({ message: 'Содержимое или URL изображения обязательны.' });
            return;
        }

        let posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
        const newPost = {
            id: Date.now(),
            user: user.email,
            content: content || '',
            image: image || '',
            timestamp: new Date().toISOString(),
            likes: 0
        };
        posts.unshift(newPost);
        fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));

        res.status(201).json(newPost);
    }
    else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};
