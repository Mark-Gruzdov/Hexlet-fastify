import fastify from 'fastify';
import formbody from '@fastify/formbody';
import view from '@fastify/view';
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
    header: 'Создать нового пользователя'
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

app.post('/users', (req, res) => {
  const user = {
    id: parseInt(req.body.id.trim()),
    username: req.body.name.trim(),
    email: req.body.email.trim().toLowerCase(),
    password: req.body.password,
  };

  state.users.push(user);

  res.redirect('/users');
});

app.post('/courses', (req, res) => {
  const course = {
    id: parseInt(req.body.id.trim()),
    title: req.body.title.trim(),
    description: req.body.description.trim(),
  };

  state.courses.push(course);

  res.redirect('/courses');
});

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});