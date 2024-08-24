import fastify from 'fastify';
import view from '@fastify/view';
import pug from 'pug';

const app = fastify();
const port = 3000;
const state = {
  users: [
    {
      id: 1,
      name: 'user',
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
  ],
};

await app.register(view, { engine: { pug } });

app.get('/', (req, res) => res.view('src/views/index'));

app.get('/users', (req, res) => {
  res.send('GET /users');
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = state.users.find((user) => user.id === parseInt(id));
  if (!user) {
    res.code(404).send('User not found');
  } else {
    res.send(user);
  }
});

app.get('/courses', (req, res) => {
  const data = {
    courses: state.courses, // Где-то хранится список курсов
    header: 'Курсы по программированию',
  };
  res.view('src/views/courses/index', data);
});

app.get('/courses/new', (req, res) => {
  res.send('Course build');
});

app.get('/courses/:id', (req, res) => {
  const { id } = req.params
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
  res.send(`Course ID: ${req.params.courseId}; Lesson ID: ${req.params.id}`);
});

app.get('/hello', (req, res) => {
  const name = req.query.name;
  if (!name) {
    res.send('Hello, World!');
  } else {
    res.send(`Hello, ${name}!`);
  }
});

app.post('/users', (req, res) => {
  res.send('POST /users');
});

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});