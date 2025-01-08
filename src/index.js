import fastify from 'fastify';
import view from '@fastify/view';
import pug from 'pug';
import formbody from '@fastify/formbody';
import routes from './routes/index.js';
import fastifyCookie from '@fastify/cookie';
import session from '@fastify/session';
import flash from '@fastify/flash';
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database(':memory:');

const prepareDatabase = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE courses (
        id INT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT
      );
    `);

    db.run(`
      CREATE TABLE users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        password VARCHAR(1000) NOT NULL
      );
    `);
  });

  const courses = [
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
  ];

  const users = [
    {
      id: 1,
      username: 'user',
      email: 'user@test.test',
      password: 'd5c4989f33ec1bf0edc5258e8202e95da5a73dac491a27742571662322fbb230589b379e1fd088bb1a12156e6cd1154cf3fdc1079d65b6c9c917904b0cb603e2' // password test
    },
  ];

  const coursesStmt = db.prepare('INSERT INTO courses VALUES (?, ?, ?)');
  const usersStmt = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?)');

  courses.forEach((course) => {
    coursesStmt.run(course.id, course.title, course.description);
  });

  users.forEach((user) => {
    usersStmt.run(user.id, user.username, user.email, user.password);
  });

  coursesStmt.finalize();
  usersStmt.finalize();
};

prepareDatabase();

const app = fastify();
const port = process.env.PORT || 3000;

await app.register(view, { engine: { pug } });
await app.register(formbody);
await app.register(fastifyCookie);
await app.register(session, {
  secret: 'a secret with minimum length of 32 characters',
  cookie: { secure: false },
});
await app.register(flash);
await app.register(routes);


app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});

export default db;