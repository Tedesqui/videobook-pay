// Ficheiro: /api/create-pagseguro-session.js (Versão com PagSeguro)

// NOTA: Diferente de outros SDKs, para o PagSeguro é comum usar a API REST diretamente com 'fetch'.
import { getAuth } from '@clerk/nextjs/server';

// Endpoint da API do PagSeguro para criar ordens de pagamento
const PAGSEGURO_API_URL = "https://api.pagseguro.com/orders";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Método não permitido');
  }

  const { userId, user } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  const pagseguroToken = process.env.PAGSEGURO_TOKEN;
  if (!pagseguroToken) {
      return res.status(500).json({ error: "A chave da API do PagSeguro não está configurada no servidor." });
  }

  // O URL do seu webhook para receber notificações de pagamento
  const notification_url = `${req.headers.origin}/api/pagseguro-webhook`;

  // Cria o corpo do pedido (payload) para a API do PagSeguro
  const orderPayload = {
    reference_id: `credit_${userId}_${Date.now()}`, // Um ID de referência único para o seu sistema
    customer: {
      name: user.firstName || "Utilizador",
      email: user.primaryEmailAddress.emailAddress,
      tax_id: "12345678909", // O PagSeguro exige um CPF. Obtenha-o do utilizador ou use um placeholder para testes.
    },
    items: [
      {
        name: '1 Crédito de Geração de Vídeo',
        quantity: 1,
        unit_amount: 500, // O valor em cêntimos (ex: 500 = R$ 5,00)
      },
    ],
    qr_codes: [
        {
            amount: {
                value: 500 // Valor para o QR Code (Pix)
            }
        }
    ],
    notification_urls: [notification_url],
  };

  try {
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
        // Se houver um erro, regista os detalhes para depuração
        console.error("Erro na API do PagSeguro:", data);
        throw new Error(data.error_messages?.[0]?.description || 'Falha ao criar o pedido de pagamento.');
    }
    
    // O link de pagamento para cartão de crédito encontra-se no primeiro objeto 'charge'
    const checkoutUrl = data.charges?.[0]?.links?.find(link => link.rel === 'pay').href;

    if (!checkoutUrl) {
        throw new Error("Não foi possível encontrar o link de pagamento na resposta do PagSeguro.");
    }

    // Devolve o URL de checkout para o frontend
    res.status(200).json({ url: checkoutUrl });

  } catch (error) {
    console.error("Erro ao criar pedido do PagSeguro:", error);
    res.status(500).json({ error: error.message });
  }
}
