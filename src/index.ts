import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as serve from 'koa-static';
import * as path from 'path';

import HomeRouter from './routes/home';

const app = new Koa();
app.use(serve(path.join(__dirname, '/public')));
app.use(bodyParser({}));

app.use(HomeRouter.routes());

app.on('error', (err) => {
  console.log(err);
});

app.listen(3000, () => {
    console.log('start!');
});
