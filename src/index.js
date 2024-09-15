import fastify from 'fastify';
import formbody from '@fastify/formbody';
import view from '@fastify/view';
import * as yup from 'yup';
import sanitize from 'sanitize-html';
import pug from 'pug';

const app = fastify();
const port = 3000;
const state = {
  users: [
    {
      id: 1,
      username: 'user',
      email: 'user@test.test',
      password: 'test'
    },
  ],
  courses: [
    {
      id: 1,
      title: 'JS: Массивы',
      description: 'Курс про массивы в JavaScript',
    },
    {
      id: 2,
      title: 'JS: Функции',
      description: 'Курс про функции в JavaScript',
    },
    {
      id: 3,
      title: 'JS: Объекты',
      description: 'Курс про объекты в JavaScript',
    },
  ],
};

await app.register(formbody);
await app.register(view, { engine: { pug } });

app.get('/', (req, res) => res.view('src/views/index'));

app.get('/users', (req, res) => {
  const { term } = req.query;
  const data = {
    term,
    header: 'Список пользователей',
  };

  if (term) {
    data.users = state.users.filter((user) => user.id === parseInt(term) 
      || user.username.toLowerCase().includes(term.toLowerCase()));
  } else {
    data.users = state.users;
  }
  res.view('src/views/users/index', data);
});

app.get('/users/new', (req, res) => {
  const data = {
    header: 'Создать нового пользователя'
  }
  res.view('src/views/users/new', data);
});

app.get('/users/:id', (req, res) => {
  const escapedId = sanitize(req.params.id);
  res.type('html');
  res.send(`<h1>${escapedId}</h1>`);
});

app.get('/courses', (req, res) => {
  const { term } = req.query;
  const data = {
    term,
    header: 'Курсы по программированию',
  };

  if (term) {
    data.courses = state.courses.filter((course) => course.id === parseInt(term) 
      || course.description.toLowerCase().includes(term.toLowerCase()));
  } else {
    data.courses = state.courses;
  }
  res.view('src/views/courses/index', data);
});

app.get('/courses/new', (req, res) => {
  const data = {
    header: 'Добавить новый курс'
  }
  res.view('src/views/courses/new', data);
});

app.get('/courses/:id', (req, res) => {
  const { id } = req.params;
  const course = state.courses.find(({ id: courseId }) => courseId === parseInt(id));
  if (!course) {
    res.code(404).send({ message: 'Course not found' });
    return;
  }
  const data = {
    course,
  };
  res.view('src/views/courses/show', data);
});

app.get('/courses/:courseId/lessons/:id', (req, res) => {
  const sanitizeCourse = sanitize(req.params.courseId);
  const sanitizeLesson = sanitize(req.params.id);
  res.send(`Course ID: ${sanitizeCourse}; Lesson ID: ${sanitizeLesson}`);
});

app.get('/hello', (req, res) => {
  const name = sanitize(req.query.name);
  if (!name) {
    res.send('Hello, World!');
  } else {
    res.send(`Hello, ${name}!`);
  }
});

app.post('/users', {
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
    };

    res.view('src/views/users/new', data);
    return;
  }

  const user = {
    id: parseInt(id),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: password,
  };

  state.users.push(user);

  res.redirect('/users');
});

app.post('/courses', {
  attachValidation: true,
  schema: {
    body: yup.object({
      id: yup.number().integer(),
      title: yup.string().min(2, 'Заголовок должен быть не менее 2 символов'),
      description: yup.string().min(10, 'Описание должно быть не менее 10 символов'),
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
  const { id, title, description } = req.body;

  if (req.validationError) {
    const data = {
      id, title, description,
      header: 'Добавить новый курс',
      error: req.validationError,
    };

    res.view('src/views/courses/new', data);
    return;
  }

  const course = {
    id: parseInt(id),
    title: title.trim(),
    description: description.trim(),
  };

  state.courses.push(course);

  res.redirect('/courses');
});

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});