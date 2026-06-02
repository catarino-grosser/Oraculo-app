// Este arquivo rodará nos servidores do Netlify (Backend)

export default async (request, context) => {
    // A chave da API do Google Gemini ficará segura no painel do Netlify
    const API_KEY = process.env.GEMINI_API_KEY;

    // Proteção: garante que a requisição seja um POST (envio de dados)
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ erro: "Método não permitido" }), { status: 405 });
    }

    try {
        // Pega os dados que o Frontend (seu app.js) vai enviar
        const body = await request.json();
        const pergunta = body.pergunta;
        const cartas = body.cartas; // Ex: "O Louco, A Estrela, O Mundo"

        // O PROMPT: É aqui que programamos o comportamento do Tarot
        const prompt = `Você é um tarólogo místico, sábio e experiente. 
        O consulente fez a seguinte pergunta: "${pergunta}". 
        As cartas sorteadas nas posições de Passado, Presente e Futuro foram, respectivamente: ${cartas}. 
        Escreva uma leitura de tarot em 3 parágrafos interpretando o significado profundo e arquetípico dessas cartas no contexto exato da pergunta. Seja direto, empático e evite formatações de texto complexas, use apenas parágrafos simples.`;

        // O endereço oficial da API do Gemini
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
        
        // Fazendo o pedido para a IA do Google
        const respostaIA = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const dados = await respostaIA.json();

        // Se a API retornar erro (ex: chave inválida), disparamos um aviso
        if (!respostaIA.ok) {
            throw new Error(dados.error?.message || "Erro na comunicação com a IA");
        }

        // Navegamos pelo objeto de resposta do Google para extrair apenas o texto
        const textoLeitura = dados.candidates[0].content.parts[0].text;

        // Devolvemos a leitura pronta para o Frontend exibir na tela
        return new Response(JSON.stringify({ leitura: textoLeitura }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ erro: "Falha ao consultar o oráculo. Tente novamente." }), { status: 500 });
    }
};
