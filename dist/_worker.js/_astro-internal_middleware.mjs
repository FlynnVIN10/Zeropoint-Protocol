globalThis.process ??= {}; globalThis.process.env ??= {};
import './chunks/astro-designed-error-pages_DTksPC61.mjs';
import './chunks/astro/server_C2tHotcq.mjs';
import { s as sequence } from './chunks/index_5YLIBp2Y.mjs';

const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.runtime ??= {
      env: process.env
    };
  }
  return next();
};

const onRequest = sequence(
	onRequest$1,
	
	
);

export { onRequest };
