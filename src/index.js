import fastify from 'fastify';
import sanitize from 'sanitize-html';
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
    {
      id: 3,
      title: 'JS: Объекты',
      description: 'Курс про объекты в JavaScript',
    },
  ],
};

await app.register(view, { engine: { pug } });

app.get('/', (req, res) => res.view('src/views/index'));

app.get('/users', (req, res) => {
  res.send('GET /users');
});

app.get('/users/:id', (req, res) => {
  const escapedId = sanitize(req.params.id);
  res.type('html');
  res.send(`<h1>${escapedId}</h1>`);
});

app.get('/courses', (req, res) => {
  const term = req.query.term ?? '';
  const data = {
    term,
    header: 'Курсы по программированию',
  };

  if (term.length > 0) {
    data.courses = state.courses.filter((course) => course.id === parseInt(term) || course.description.includes(term));
  } else {
    data.courses = state.courses;
  }
  
  res.view('src/views/courses/index', data);
});

app.get('/courses/new', (req, res) => {
  res.send('Course build');
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
  res.send('POST /users');
});

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});