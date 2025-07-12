// Ficheiro: /api/create-pagseguro-session.js (Versão com tratamento de erros melhorado)

import { getAuth } from '@clerk/nextjs/server';

const PAGSEGURO_API_URL = "https://api.pagseguro.com/orders";

export default async function handler(req, res) {
  // Envolve todo o processo num bloco try...catch para garantir que uma resposta seja sempre enviada.
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: "Método não permitido" });
    }

    // --- Verificação de Autenticação e Configuração ---
    const { userId, user } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    const pagseguroToken = process.env.PAGSEGURO_TOKEN;
    if (!pagseguroToken) {
      console.error("ERRO GRAVE: A variável de ambiente PAGSEGURO_TOKEN não está definida.");
      return res.status(500).json({ error: "A configuração de pagamento do servidor está em falta." });
    }

    // --- Criação do Pedido para o PagSeguro ---
    const notification_url = `${req.headers.origin}/api/pagseguro-webhook`;
    const orderPayload = {
      reference_id: `credit_${userId}_${Date.now()}`,
      customer: {
        name: user.firstName || "Utilizador",
        email: user.primaryEmailAddress.emailAddress,
        tax_id: "12345678909", // O PagSeguro exige um CPF. Obtenha-o do utilizador ou use um placeholder para testes.
      },
      items: [
        {
          name: '1 Crédito de Geração de Vídeo',
          quantity: 1,
          unit_amount: 500, // Valor em cêntimos (ex: 500 = R$ 5,00)
        },
      ],
      qr_codes: [{ amount: { value: 500 } }],
      notification_urls: [notification_url],
    };

    // --- Chamada à API do PagSeguro ---
    const response = await fetch(PAGSEGURO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pagseguroToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const responseText = await response.text(); // Lê a resposta como texto para evitar erros de JSON
    
    if (!response.ok) {
      console.error("Erro recebido da API do PagSeguro:", responseText);
      // Tenta analisar o erro se for JSON, senão devolve o texto bruto
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.error_messages?.[0]?.description || 'Falha ao criar o pedido de pagamento.');
      } catch (e) {
        throw new Error('O PagSeguro devolveu uma resposta inesperada.');
      }
    }

    const data = JSON.parse(responseText);
    const checkoutUrl = data.charges?.[0]?.links?.find(link => link.rel === 'pay').href;

    if (!checkoutUrl) {
      console.error("Estrutura de resposta inesperada do PagSeguro:", data);
      throw new Error("Não foi possível encontrar o link de pagamento na resposta do PagSeguro.");
    }

    // --- Envio da Resposta para o Frontend ---
    return res.status(200).json({ url: checkoutUrl });

  } catch (error) {
    console.error("Erro no endpoint create-pagseguro-session:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
