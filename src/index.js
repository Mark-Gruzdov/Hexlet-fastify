import fastify from 'fastify';
import formbody from '@fastify/formbody';
import view from '@fastify/view';
import pug from 'pug';
import routes from './routes/index.js';


const app = fastify();
const port = 3000;

await app.register(formbody);
await app.register(view, { engine: { pug } });
await app.register(routes);

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});