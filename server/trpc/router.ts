import { router } from "./init";
import { categoriesRouter } from "./routers/categories";
import { conversationsRouter } from "./routers/conversations";
import { helloRouter } from "./routers/hello";
import { ordersRouter } from "./routers/orders";
import { producersRouter } from "./routers/producers";
import { productsRouter } from "./routers/products";
import { reviewsRouter } from "./routers/reviews";

export const appRouter = router({
  hello: helloRouter,
  categories: categoriesRouter,
  producers: producersRouter,
  products: productsRouter,
  orders: ordersRouter,
  conversations: conversationsRouter,
  reviews: reviewsRouter,
});

export type AppRouter = typeof appRouter;
