// api/global-messages.js

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    const globalMessagesPath = path.join(__dirname, '../global-messages.json');
    const onlineUsersPath = path.join(__dirname, '../online-users.json');

    if (req.method === 'GET') {
        // Получение всех глобальных сообщений
        let messages = JSON.parse(fs.readFileSync(globalMessagesPath, 'utf8'));
        res.status(200).json(messages);
    }
    else if (req.method === 'POST') {
        // Отправка нового глобального сообщения
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

        const { content } = req.body;
        if (!content) {
            res.status(400).json({ message: 'Содержимое обязательно.' });
            return;
        }

        let messages = JSON.parse(fs.readFileSync(globalMessagesPath, 'utf8'));
        const newMessage = {
            id: Date.now(),
            user: user.email,
            content,
            timestamp: new Date().toISOString()
        };
        messages.unshift(newMessage);
        fs.writeFileSync(globalMessagesPath, JSON.stringify(messages, null, 2));

        res.status(201).json(newMessage);
    }
    else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};
