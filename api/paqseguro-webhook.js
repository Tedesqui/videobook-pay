// Ficheiro: /api/pagseguro-webhook.js
// Este endpoint recebe notificações do PagSeguro e atualiza a base de dados.

import { sql } from '@vercel/postgres';

// NOTA: A verificação de webhooks do PagSeguro é feita através de um ID de notificação,
// e não de uma assinatura no cabeçalho como no Stripe.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Método não permitido');
  }

  const { notificationCode, notificationType } = req.body;

  if (notificationType !== 'transaction') {
    // Ignora notificações que não são de transação
    return res.status(200).send('Notificação ignorada.');
  }

  try {
    // Com o código da notificação, você faria uma chamada à API do PagSeguro
    // para obter os detalhes da transação e confirmar que foi paga.
    // Ex: const transactionDetails = await getTransactionDetails(notificationCode);
    
    // **SIMULAÇÃO:** Para este exemplo, vamos assumir que a transação foi verificada
    // e que o ID do utilizador foi passado na referência da transação.
    // A API de consulta de notificações do PagSeguro devolveria o 'reference_id'.
    
    // Num projeto real, o 'reference_id' seria extraído da resposta da API de consulta.
    // Ex: const clerkId = transactionDetails.reference;
    
    // Para este exemplo, não temos como obter o clerkId de forma segura sem a chamada real,
    // então vamos apenas registar a notificação.
    // É CRUCIAL implementar a chamada de verificação num projeto de produção.
    
    console.log(`Notificação de transação recebida do PagSeguro: ${notificationCode}`);
    
    // **LÓGICA DE EXEMPLO DE COMO SERIA:**
    // const clerkId = await getClerkIdFromPagSeguroNotification(notificationCode);
    // if (clerkId) {
    //   await sql`
    //     INSERT INTO users (clerk_id, credits)
    //     VALUES (${clerkId}, 1)
    //     ON CONFLICT (clerk_id) 
    //     DO UPDATE SET 
    //       credits = users.credits + 1;
    //   `;
    //   console.log(`1 crédito adicionado ao utilizador ${clerkId}.`);
    // }

    res.status(200).send('Notificação recebida com sucesso.');

  } catch (error) {
    console.error("Erro ao processar webhook do PagSeguro:", error);
    res.status(500).send("Erro interno ao processar notificação.");
  }
}
