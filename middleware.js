// Ficheiro: middleware.js (na raiz do projeto)

import { clerkMiddleware } from '@clerk/nextjs/server';

// Esta é a forma mais direta e robusta de configurar o middleware,
// passando as rotas como opções, o que evita potenciais problemas de invocação.
export default clerkMiddleware({
  // Rotas que qualquer pessoa pode aceder, mesmo sem login.
  publicRoutes: [
    '/', 
    '/sign-in(.*)', 
    '/sign-up(.*)'
  ],
  
  // Rotas que o Clerk deve ignorar completamente (essencial para webhooks).
  ignoredRoutes: [
    '/api/pagseguro-webhook',
    '/api/stripe-webhook'
  ],
});

export const config = {
  // O "matcher" define quais as rotas que irão passar pelo middleware do Clerk.
  // Esta configuração cobre todas as rotas, exceto as de ficheiros estáticos.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
