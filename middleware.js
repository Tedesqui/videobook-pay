// Ficheiro: middleware.js (na raiz do projeto)

import { clerkMiddleware } from '@clerk/nextjs/server';

// A abordagem recomendada é passar as rotas públicas e ignoradas
// diretamente como opções para o clerkMiddleware.
export default clerkMiddleware({
  publicRoutes: [
    '/', // A sua página inicial, se for pública
    '/sign-in(.*)', 
    '/sign-up(.*)'
  ],
  ignoredRoutes: [
    '/api/pagseguro-webhook',
    '/api/stripe-webhook' // Adicione outros webhooks aqui se os tiver
  ],
});

export const config = {
  // O "matcher" define quais as rotas que irão passar pelo middleware do Clerk.
  // Esta configuração cobre todas as rotas, exceto as de ficheiros estáticos.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
