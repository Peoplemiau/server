// api/like.js

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    if (req.method !== 'PUT') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    const { id, likes } = req.body;

    if (!id || likes === undefined) {
        res.status(400).json({ message: 'ID поста и количество лайков обязательны.' });
        return;
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Неавторизован.' });
        return;
    }

    const token = authHeader.split(' ')[1];
    const onlineUsersPath = path.join(__dirname, '../online-users.json');
    let onlineUsers = JSON.parse(fs.readFileSync(onlineUsersPath, 'utf8'));
    const user = onlineUsers.find(user => user.token === token);
    if (!user) {
        res.status(401).json({ message: 'Неверный токен.' });
        return;
    }

    let posts = JSON.parse(fs.readFileSync(path.join(__dirname, '../posts.json'), 'utf8'));
    const post = posts.find(p => p.id == id);
    if (!post) {
        res.status(404).json({ message: 'Пост не найден.' });
        return;
    }

    post.likes = likes;
    fs.writeFileSync(path.join(__dirname, '../posts.json'), JSON.stringify(posts, null, 2));

    res.status(200).json(post);
};
