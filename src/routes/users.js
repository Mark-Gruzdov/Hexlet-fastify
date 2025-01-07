import * as yup from 'yup';
import sanitize from 'sanitize-html';
import encrypt from '../encrypt.js';
import db from '../index.js';

const routes = {
  mainPagePath: () => '/',
  usersPath: () => '/users',
  newUserPath: () => '/users/new',
  userPath: (id) => `/users/${id}`,
};

export default (app) => {

  // Просмотр списка пользователей
  app.get(routes.usersPath(), (req, res) => {
    const { term } = req.query;

    db.all('SELECT * FROM users', (error, data) => {
      const templateData = {
        term,
        header: 'Список пользователей',
        messages: res.flash('success'),
        routes,
        error,
      };

      if (term) {
        templateData.users = data.filter((user) => user.id === parseInt(term) 
          || user.username.toLowerCase().includes(term.toLowerCase()));
      } else {
        templateData.users = data;
      }
      res.view('src/views/users/index', templateData);
    });
  });


  // Форма создания нового пользователя
  app.get(routes.newUserPath(), (req, res) => {
    const data = {
      header: 'Создать нового пользователя',
      routes,
    }
    res.view('src/views/users/new', data);
  });


  // Просмотр конкретного пользователя
  app.get(routes.userPath(':id'), (req, res) => {
    const escapedId = sanitize(req.params.id);
    res.type('html');
    res.send(`<h1>${escapedId}</h1>`);
  });


  // Создание нового пользователя
  app.post(routes.usersPath(), {
    attachValidation: true,
    schema: {
      body: yup.object({
        id: yup.number().integer(),
        username: yup.string().min(2, 'Имя должно быть не меньше двух символов'),
        email: yup.string().email(),
        password: yup.string().min(5, 'Пароль должен быть не менее 5 символов'),
        passwordConfirmation: yup.string().min(5),
      }),
    },
    validatorCompiler: ({ schema, method, url, httpPart }) => (data) => {
      if (data.password !== data.passwordConfirmation) {
        return {
          error: Error('Password confirmation is not equal the password'),
        };
      }
      try {
        const result = schema.validateSync(data);
        return { value: result };
      } catch (e) {
        return { error: e };
      }
    },
  },(req, res) => {
    const { id, username, email, password, passwordConfirmation } = req.body;

    if (req.validationError) {
      req.flash('error', { type: 'info', message: 'Ошибка регистрации' });

      const data = {
        id, username, email, password, passwordConfirmation,
        header: 'Создать нового пользователя',
        error: req.validationError,
        messages: res.flash('error'),
        routes,
      };

      res.view('src/views/users/new', data);
      return;
    }

    const user = {
      id: parseInt(id),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: encrypt(password),
      routes,
    };

    const stmt = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?)');

    stmt.run([user.id, user.username, user.email, user.password], function (error) {
      if (error) {
        req.flash('error', { type: 'info', message: 'Ошибка записи нового пользователя' });
        const templateData = {
          id: user.id,
          username: user.username,
          email: user.email,
          password: user.password,
          header: 'Создать нового пользователя',
          messages: res.flash('error'),
          error,
          routes,
        };
        res.view('src/views/users/new', templateData);
        return;
      }
      req.flash('success', { type: 'success', message: 'Пользователь зарегистрирован' });
      res.redirect(routes.usersPath());
    });    
  });
};