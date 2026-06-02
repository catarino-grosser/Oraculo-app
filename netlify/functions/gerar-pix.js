// Este arquivo rodará nos servidores do Netlify (Backend)

export default async (request, context) => {
    // 1. O Netlify pegará a sua Chave Secreta das Variáveis de Ambiente (que vamos configurar depois)
    const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

    // 2. Proteção básica: garantir que a requisição seja um POST
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ erro: "Método não permitido" }), { status: 405 });
    }

    try {
        // 3. Montar as informações da cobrança
        const pagamentoDados = {
            transaction_amount: 1.00, // O valor do jogo
            description: "Leitura de Tarot Místico",
            payment_method_id: "pix", // O método de pagamento
            payer: {
                // Aqui podemos colocar um e-mail genérico ou pegar do usuário depois
                email: "cliente_tarot@oraculo.com"
            }
        };

        // 4. Fazer o pedido para a API do Mercado Pago
        const respostaMP = await fetch("https://api.mercadopago.com/v1/payments", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                // O Mercado Pago exige uma chave única para evitar cobranças duplicadas
                "X-Idempotency-Key": crypto.randomUUID() 
            },
            body: JSON.stringify(pagamentoDados)
        });

        const resultado = await respostaMP.json();

        // 5. Se der erro no Mercado Pago, avisamos o site
        if (!respostaMP.ok) {
            throw new Error(resultado.message || "Erro ao gerar Pix no Mercado Pago");
        }

        // 6. Se deu tudo certo, enviamos apenas o Pix Copia e Cola para o site mostrar na tela
        return new Response(JSON.stringify({
            id: resultado.id,
            status: resultado.status,
            qr_code: resultado.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: resultado.point_of_interaction.transaction_data.qr_code_base64
        }), { 
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        // Captura de segurança caso o servidor falhe
        return new Response(JSON.stringify({ erro: error.message }), { status: 500 });
    }
};
