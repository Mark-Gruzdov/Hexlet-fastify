import sanitize from 'sanitize-html';
import encrypt from '../encrypt.js';
import db from '../index.js';

const routes = {
  mainPagePath: () => '/',
  usersPath: () => '/users',
  coursesPath: () => '/courses',
  loginPath: () => '/login'
};

export default (app) => {

  // Просмотр главной страницы
  app.get(routes.mainPagePath(), (req, res) => {
    const visited = req.cookies.visited;
    const templateData = {
      messages: res.flash('success'),
      visited,
      routes,
    };
    res.cookie('visited', true);

    res.view('src/views/index', templateData);
  });

  // Просмотр страницы аутентификации
  app.get(routes.loginPath(), (req, res) => {
    const data = {
      header: 'Аутентификация',
      routes,
    }

    res.view('src/views/login', data);
  });

  app.post('/session', (req, res) => {
    const { email, password } = req.body;
    
    db.all('SELECT * FROM users', (error, data) => {
      const currentUser = data.find((user) => user.email === email);

      if (currentUser && currentUser.password === encrypt(password)) {
        req.session.userId = currentUser.id;
      } else {
        req.flash('error', { type: 'info', message: 'Неверный логин или пароль' });

        const data = {
          email, password,
          header: 'Аутентификация',
          error,
          messages: res.flash('error'),
          routes,
        };
  
        res.view('src/views/login', data);
        return;
      }
      req.flash('success', { type: 'success', message: 'Авторизация прошла успешно!' });
      res.redirect(routes.mainPagePath());
    });    
  });


  // Первый запрос с приветствием
  app.get('/hello', (req, res) => {
    const name = sanitize(req.query.name);
    if (!name) {
      res.send('Hello, World!');
    } else {
      res.send(`Hello, ${name}!`);
    }
  });

};