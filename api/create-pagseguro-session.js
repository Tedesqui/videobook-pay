// Ficheiro: /api/create-pagseguro-session.js

import { getAuth } from '@clerk/nextjs/server';

const PAGSEGURO_API_URL = "https://api.pagseguro.com/orders";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { userId, user } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    const pagseguroToken = process.env.PAGSEGURO_TOKEN;
    if (!pagseguroToken) {
        return res.status(500).json({ error: "A chave da API do PagSeguro não está configurada no servidor." });
    }

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

    const response = await fetch(PAGSEGURO_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pagseguroToken}`,
        },
        body: JSON.stringify(orderPayload),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Erro na API do PagSeguro:", data);
        throw new Error(data.error_messages?.[0]?.description || 'Falha ao criar o pedido de pagamento.');
    }
    
    const checkoutUrl = data.charges?.[0]?.links?.find(link => link.rel === 'pay').href;

    if (!checkoutUrl) {
        throw new Error("Não foi possível encontrar o link de pagamento na resposta do PagSeguro.");
    }

    res.status(200).json({ url: checkoutUrl });

  } catch (error) {
    console.error("Erro ao criar pedido do PagSeguro:", error);
    res.status(500).json({ error: error.message });
  }
}
