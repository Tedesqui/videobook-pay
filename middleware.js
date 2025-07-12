// Ficheiro: middleware.js (na raiz do projeto)

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define quais as rotas que são públicas (acessíveis sem login)
const isPublicRoute = createRouteMatcher([
    '/', // A sua página inicial, se for pública
    '/sign-in(.*)', 
    '/sign-up(.*)'
]);

// Define quais as rotas que devem ser ignoradas pelo middleware (ex: webhooks)
const isIgnoredRoute = createRouteMatcher([
    '/api/pagseguro-webhook',
    '/api/stripe-webhook' // Adicione outros webhooks aqui se os tiver
]);

export default clerkMiddleware((auth, req) => {
  // Se a rota não for pública e não for ignorada, protege-a.
  if (!isPublicRoute(req) && !isIgnoredRoute(req)) {
    auth().protect();
  }
});

export const config = {
  // O "matcher" define quais as rotas que irão passar pelo middleware do Clerk.
  // Esta configuração cobre todas as rotas, exceto as de ficheiros estáticos.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
