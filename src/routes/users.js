import * as yup from 'yup';
import sanitize from 'sanitize-html';

const routes = {
  mainPagePath: () => '/',
  usersPath: () => '/users',
  newUserPath: () => '/users/new',
  userPath: (id) => `/users/${id}`,
};
const state = {
  users: [
    {
      id: 1,
      username: 'user',
      email: 'user@test.test',
      password: 'test'
    },
  ],
};

export default (app) => {

  // Просмотр списка пользователей
  app.get(routes.usersPath(), (req, res) => {
    const { term } = req.query;
    const data = {
      term,
      header: 'Список пользователей',
      routes,
    };

    if (term) {
      data.users = state.users.filter((user) => user.id === parseInt(term) 
        || user.username.toLowerCase().includes(term.toLowerCase()));
    } else {
      data.users = state.users;
    }
    res.view('src/views/users/index', data);
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
      const data = {
        id, username, email, password, passwordConfirmation,
        header: 'Создать нового пользователя',
        error: req.validationError,
        routes,
      };

      res.view('src/views/users/new', data);
      return;
    }

    const user = {
      id: parseInt(id),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      routes,
    };

    state.users.push(user);

    res.redirect(routes.usersPath());
  });

};