// api/online-users.js

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    const onlineUsersPath = path.join(__dirname, '../online-users.json');
    let onlineUsers = JSON.parse(fs.readFileSync(onlineUsersPath, 'utf8'));
    res.status(200).json(onlineUsers);
};
