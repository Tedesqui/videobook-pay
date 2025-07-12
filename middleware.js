// Ficheiro: middleware.js (na raiz do projeto)

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define as rotas que não exigem autenticação.
const isPublicRoute = createRouteMatcher([
  '/', // A sua página inicial, se for pública
  '/sign-in(.*)', // Rotas de sign-in
  '/sign-up(.*)', // Rotas de sign-up
]);

// Define as rotas que devem ser completamente ignoradas pelo Clerk (ex: webhooks).
const isIgnoredRoute = createRouteMatcher([
    '/api/pagseguro-webhook',
    '/api/stripe-webhook' // Adicione outros webhooks aqui se os tiver
]);

// Esta é a função de middleware principal.
export default clerkMiddleware((auth, req) => {
  // Se a rota for uma das ignoradas (como um webhook), o middleware não faz nada.
  if (isIgnoredRoute(req)) {
    return;
  }
  
  // Se a rota não for pública, o middleware protege-a, exigindo login.
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  // O "matcher" define quais as rotas que irão passar pelo middleware do Clerk.
  // Esta configuração cobre todas as rotas, exceto as de ficheiros estáticos.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};

