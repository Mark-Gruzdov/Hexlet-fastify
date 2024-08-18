import fastify from 'fastify';

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
    
  ],
};


app.get('/users', (req, res) => {
  res.send('GET /users');
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = state.users.find((user) => user.id === parseInt(id));
  if (!user) {
    res.code(404).send({ message: 'User not found' });
  } else {
    res.send(user);
  }
});

app.post('/users', (req, res) => {
  res.send('POST /users');
});

app.get('/courses/new', (req, res) => {
  res.send('Course build');
});

app.get('/courses/:id', (req, res) => {
  res.send(`Course ID: ${req.params.id}`);
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

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});