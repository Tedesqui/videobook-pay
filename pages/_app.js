// Ficheiro: /pages/_app.js
// Este é o ficheiro de layout principal que envolve toda a sua aplicação.

import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css'; // Supondo que você tenha um ficheiro de estilos globais

function MyApp({ Component, pageProps }) {
  return (
    // O ClerkProvider envolve toda a sua aplicação,
    // disponibilizando o contexto de autenticação a todos os componentes.
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
