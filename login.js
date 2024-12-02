// api/login.js

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email и пароль обязательны.' });
        return;
    }

    const usersPath = path.join(__dirname, '../users.json');
    let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        res.status(400).json({ message: 'Неверные учетные данные.' });
        return;
    }

    // Генерация простого токена
    const token = Math.random().toString(36).substring(2);

    // Обновление статуса пользователя
    user.online = true;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    // Добавление в онлайн пользователей
    const onlineUsersPath = path.join(__dirname, '../online-users.json');
    let onlineUsers = JSON.parse(fs.readFileSync(onlineUsersPath, 'utf8'));
    onlineUsers.push({ email, token });
    fs.writeFileSync(onlineUsersPath, JSON.stringify(onlineUsers, null, 2));

    res.status(200).json({ message: 'Вход успешен.', token, email });
};
