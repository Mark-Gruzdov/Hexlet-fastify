import sanitize from 'sanitize-html';

const routes = {
  mainPagePath: () => '/',
  usersPath: () => '/users',
  coursesPath: () => '/courses',
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