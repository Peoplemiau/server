// api/register.js

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

    const userExists = users.find(user => user.email === email);
    if (userExists) {
        res.status(400).json({ message: 'Пользователь уже существует.' });
        return;
    }

    const newUser = { email, password, online: false };
    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.status(201).json({ message: 'Пользователь зарегистрирован успешно.' });
};
