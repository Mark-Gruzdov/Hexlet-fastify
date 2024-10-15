import sanitize from 'sanitize-html';

const routes = {
  mainPagePath: () => '/',
  usersPath: () => '/users',
  coursesPath: () => '/courses',
};

export default (app) => {

  // Просмотр главной страницы
  app.get(routes.mainPagePath(), (req, res) => res.view('src/views/index', routes));


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