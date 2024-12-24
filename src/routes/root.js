import sanitize from 'sanitize-html';
import encrypt from '../encrypt.js';
import { state } from './users.js';

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
      visited,
    };
    res.cookie('visited', true);

    res.view('src/views/index', {routes, templateData});
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
    const user = state.users.find(({ email: userEmail }) => userEmail === email);
    
    if (user.password === encrypt(password)) {
      req.session.userId = user.id;
    }

    res.redirect(routes.mainPagePath());
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