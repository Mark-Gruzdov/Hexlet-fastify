import fastify from 'fastify';
import view from '@fastify/view';
import pug from 'pug';
import formbody from '@fastify/formbody';
import routes from './routes/index.js';
import fastifyCookie from '@fastify/cookie';
import session from '@fastify/session';


const app = fastify();
const port = 3000;

await app.register(view, { engine: { pug } });
await app.register(formbody);
await app.register(fastifyCookie);
await app.register(session, {
  secret: 'a secret with minimum length of 32 characters',
  cookie: { secure: false },
});
await app.register(routes);


app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});