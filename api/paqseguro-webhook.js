// Ficheiro: /api/pagseguro-webhook.js
// Este endpoint recebe notificações do PagSeguro e atualiza a base de dados.

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Apenas aceita pedidos do tipo POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Método não permitido');
  }

  try {
    const notification = req.body;
    console.log("Webhook do PagSeguro recebido:", JSON.stringify(notification, null, 2));

    // Verifica se a notificação é de uma cobrança paga (status 'PAID')
    if (notification.charges && notification.charges[0].status === 'PAID') {
        const charge = notification.charges[0];
        const referenceId = notification.reference_id; // Ex: "credit_user_xxxx_167..."

        if (!referenceId) {
            console.error("Erro: reference_id não encontrado na notificação do PagSeguro.");
            return res.status(400).send("reference_id em falta.");
        }

        // Extrai o clerkId do reference_id, que foi definido durante a criação do pagamento
        const clerkId = referenceId.split('_')[1];

        if (!clerkId) {
            console.error("Erro: Não foi possível extrair o clerkId do reference_id:", referenceId);
            return res.status(400).send("clerkId inválido.");
        }

        console.log(`Pagamento confirmado para o utilizador do Clerk: ${clerkId}`);
        
        // **LÓGICA REAL DA BASE DE DADOS:**
        // Adiciona 1 crédito à conta do utilizador.
        // Se o utilizador não existir, cria um novo registo.
        // Se já existir, incrementa os seus créditos.
        await sql`
            INSERT INTO users (clerk_id, email, credits)
            VALUES (${clerkId}, ${notification.customer.email}, 1)
            ON CONFLICT (clerk_id) 
            DO UPDATE SET 
              credits = users.credits + 1;
        `;
        console.log(`1 crédito adicionado ao utilizador ${clerkId}.`);
    }

    // Responde ao PagSeguro com sucesso para indicar que a notificação foi recebida.
    res.status(200).send('Notificação recebida com sucesso.');

  } catch (error) {
    console.error("Erro ao processar webhook do PagSeguro:", error);
    res.status(500).send("Erro interno ao processar notificação.");
  }
}
