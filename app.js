// app.js

const API_BASE_URL = 'https://ваш-бэкенд.vercel.app/api'; // Замените на URL вашего бэкенда на Vercel

// Элементы страницы
const registrationSection = document.getElementById('registration-section');
const loginSection = document.getElementById('login-section');
const messagingSection = document.getElementById('messaging-section');
const logoutButton = document.getElementById('logout-button');

const showLoginButton = document.getElementById('show-login-button');
const registerButton = document.getElementById('register-button');
const loginButton = document.getElementById('login-button');
const createPostButton = document.getElementById('create-post-button');
const sendMessageButton = document.getElementById('send-message-button');

const postsContainer = document.getElementById('posts');
const onlineUsersContainer = document.getElementById('online-users');
const globalMessagesContainer = document.getElementById('global-messages');

// Обработчики событий
showLoginButton.addEventListener('click', showLogin);
registerButton.addEventListener('click', register);
loginButton.addEventListener('click', login);
createPostButton.addEventListener('click', createPost);
sendMessageButton.addEventListener('click', sendGlobalMessage);
logoutButton.addEventListener('click', logout);

// Функции для переключения разделов
function showLogin() {
    registrationSection.style.display = 'none';
    loginSection.style.display = 'block';
    messagingSection.style.display = 'none';
}

function showRegistration() {
    registrationSection.style.display = 'block';
    loginSection.style.display = 'none';
    messagingSection.style.display = 'none';
}

function showMessaging() {
    registrationSection.style.display = 'none';
    loginSection.style.display = 'none';
    messagingSection.style.display = 'block';
    logoutButton.style.display = 'block';
}

// Регистрация пользователя
async function register() {
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();

    if (!email || !password) {
        alert('Пожалуйста, введите email и пароль.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Регистрация успешна! Теперь вы можете войти.');
            showLogin();
        } else {
            alert(data.message || 'Регистрация не удалась.');
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        alert('Произошла ошибка при регистрации.');
    }
}

// Вход пользователя
async function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
        alert('Пожалуйста, введите email и пароль.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showMessaging();
            loadPosts();
            loadOnlineUsers();
            loadGlobalMessages();
        } else {
            alert(data.message || 'Вход не удался.');
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        alert('Произошла ошибка при входе.');
    }
}

// Выход пользователя
function logout() {
    localStorage.removeItem('token');
    showRegistration();
    postsContainer.innerHTML = '';
    onlineUsersContainer.innerHTML = '';
    globalMessagesContainer.innerHTML = '';
    logoutButton.style.display = 'none';
}

// Создание поста
async function createPost() {
    const content = document.getElementById('post-content').value.trim();
    const imageUrl = document.getElementById('post-image').value.trim();

    if (!content && !imageUrl) {
        alert('Пожалуйста, введите содержимое или URL изображения.');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Вы должны войти, чтобы создать пост.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content, image: imageUrl })
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('post-content').value = '';
            document.getElementById('post-image').value = '';
            loadPosts();
        } else {
            alert(data.message || 'Не удалось создать пост.');
        }
    } catch (error) {
        console.error('Ошибка создания поста:', error);
        alert('Произошла ошибка при создании поста.');
    }
}

// Загрузка постов
async function loadPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`);
        const posts = await response.json();
        if (response.ok) {
            displayPosts(posts);
        } else {
            alert('Не удалось загрузить посты.');
        }
    } catch (error) {
        console.error('Ошибка загрузки постов:', error);
        alert('Произошла ошибка при загрузке постов.');
    }
}

// Отображение постов на странице
function displayPosts(posts) {
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';

        // Заголовок поста
        const postHeader = document.createElement('div');
        postHeader.className = 'post-header';
        const avatarImg = document.createElement('img');
        avatarImg.src = `https://i.imgur.com/your-avatar.png`; // Замените на динамические URL аватарок при необходимости
        avatarImg.alt = 'Аватар пользователя';
        postHeader.appendChild(avatarImg);

        const userInfo = document.createElement('span');
        userInfo.textContent = `${post.user} • ${new Date(post.timestamp).toLocaleString()}`;
        postHeader.appendChild(userInfo);

        postDiv.appendChild(postHeader);

        // Содержимое поста
        const postContent = document.createElement('div');
        postContent.className = 'post-content';
        const contentPara = document.createElement('p');
        contentPara.textContent = post.content;
        postContent.appendChild(contentPara);

        if (post.image) {
            const img = document.createElement('img');
            img.src = post.image;
            img.alt = 'Изображение поста';
            postContent.appendChild(img);
        }

        postDiv.appendChild(postContent);

        // Кнопка "Нравится"
        const likeButton = document.createElement('button');
        likeButton.className = 'like-button';
        likeButton.textContent = `❤️ Нравится (${post.likes})`;
        likeButton.addEventListener('click', () => likePost(post.id, post.likes));
        postDiv.appendChild(likeButton);

        postsContainer.appendChild(postDiv);
    });
}

// Лайк поста
async function likePost(postId, currentLikes) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Вы должны войти, чтобы поставить лайк.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/like`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: postId, likes: currentLikes + 1 })
        });

        const data = await response.json();
        if (response.ok) {
            loadPosts();
        } else {
            alert(data.message || 'Не удалось поставить лайк.');
        }
    } catch (error) {
        console.error('Ошибка лайка:', error);
        alert('Произошла ошибка при постановке лайка.');
    }
}

// Отправка глобального сообщения
async function sendGlobalMessage() {
    const messageContent = document.getElementById('global-message-input').value.trim();
    if (!messageContent) {
        alert('Пожалуйста, введите сообщение.');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Вы должны войти, чтобы отправить сообщение.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/global-messages`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: messageContent })
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('global-message-input').value = '';
            loadGlobalMessages();
        } else {
            alert(data.message || 'Не удалось отправить сообщение.');
        }
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        alert('Произошла ошибка при отправке сообщения.');
    }
}

// Загрузка глобальных сообщений
async function loadGlobalMessages() {
    try {
        const response = await fetch(`${API_BASE_URL}/global-messages`);
        const messages = await response.json();
        if (response.ok) {
            displayGlobalMessages(messages);
        } else {
            alert('Не удалось загрузить сообщения.');
        }
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
        alert('Произошла ошибка при загрузке сообщений.');
    }
}

// Отображение глобальных сообщений
function displayGlobalMessages(messages) {
    globalMessagesContainer.innerHTML = '';
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';

        const authorDiv = document.createElement('div');
        authorDiv.className = 'author';
        authorDiv.textContent = msg.user;
        messageDiv.appendChild(authorDiv);

        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'timestamp';
        timestampDiv.textContent = new Date(msg.timestamp).toLocaleString();
        messageDiv.appendChild(timestampDiv);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';
        contentDiv.textContent = msg.content;
        messageDiv.appendChild(contentDiv);

        globalMessagesContainer.prepend(messageDiv);
    });
}

// Загрузка онлайн пользователей
async function loadOnlineUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/online-users`);
        const users = await response.json();
        if (response.ok) {
            displayOnlineUsers(users);
        } else {
            alert('Не удалось загрузить онлайн пользователей.');
        }
    } catch (error) {
        console.error('Ошибка загрузки онлайн пользователей:', error);
    }
}

// Отображение онлайн пользователей
function displayOnlineUsers(users) {
    onlineUsersContainer.innerHTML = '';
    users.forEach(user => {
        const userSpan = document.createElement('span');
        userSpan.textContent = user.email;
        onlineUsersContainer.appendChild(userSpan);
    });
}

// Инициализация приложения
function init() {
    const token = localStorage.getItem('token');
    if (token) {
        showMessaging();
        loadPosts();
        loadOnlineUsers();
        loadGlobalMessages();
    } else {
        showRegistration();
    }
}

window.onload = init;
