export default async (request, context) => {
    const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (request.method !== "POST") {
        return new Response(JSON.stringify({ erro: "Método não permitido" }), { status: 405 });
    }

    try {
        const body = await request.json();
        const paymentId = body.paymentId;

        // Vai ao Mercado Pago consultar o ID deste pagamento
        const respostaMP = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${ACCESS_TOKEN}`
            }
        });

        const resultado = await respostaMP.json();

        return new Response(JSON.stringify({ status: resultado.status }), { 
            status: 200, 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (error) {
        return new Response(JSON.stringify({ erro: "Erro ao verificar pagamento" }), { status: 500 });
    }
};
