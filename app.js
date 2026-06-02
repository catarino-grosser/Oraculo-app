const mockCardsDeck = [
    { name: "O Louco", icon: "🃏" }, { name: "O Mago", icon: "🧙‍♂️" }, { name: "A Sacerdotisa", icon: "🌙" },
    { name: "A Imperatriz", icon: "👑" }, { name: "O Imperador", icon: "⚔️" }, { name: "O Hierofante", icon: "📜" },
    { name: "Os Enamorados", icon: "❤️" }, { name: "A Carruagem", icon: "🛡️" }, { name: "A Justiça", icon: "⚖️" },
    { name: "O Eremita", icon: "🏮" }, { name: "A Roda da Fortuna", icon: "🎡" }, { name: "A Força", icon: "🦁" },
    { name: "O Enforcado", icon: "⏳" }, { name: "A Morte", icon: "💀" }, { name: "A Temperança", icon: "⚱️" },
    { name: "O Diabo", icon: "🔥" }, { name: "A Torre", icon: "⚡" }, { name: "A Estrela", icon: "⭐" },
    { name: "A Lua", icon: "🔮" }, { name: "O Sol", icon: "☀️" }, { name: "O Julgamento", icon: "🔔" },
    { name: "O Mundo", icon: "🌍" }
];

const btnDraw = document.getElementById('btn-draw');
const btnReset = document.getElementById('btn-reset');
const inputQuestion = document.getElementById('user-question');
const readingResult = document.getElementById('reading-result');
const readingText = document.getElementById('reading-text');

function getRandomCards(deck, num) {
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

btnDraw.addEventListener('click', async () => {
    const question = inputQuestion.value.trim();

    if (question === "") {
        alert("Por favor, digite sua pergunta antes de consultar as cartas.");
        return;
    }

    btnDraw.disabled = true;
    btnDraw.innerText = "Embaralhando as cartas...";

    const selectedCards = getRandomCards(mockCardsDeck, 3);
    const nomesDasCartas = `${selectedCards[0].name}, ${selectedCards[1].name} e ${selectedCards[2].name}`;

    selectedCards.forEach((cardData, index) => {
        const cardElement = document.getElementById(`card-${index + 1}`);
        cardElement.querySelector('.card-title').innerText = cardData.name;
        cardElement.querySelector('.card-illustration').innerText = cardData.icon;

        setTimeout(() => {
            cardElement.classList.add('flipped');
        }, index * 400);
    });

    btnDraw.innerText = "Invocando o Oráculo...";

    try {
        // Aqui o Frontend chama o Backend que criamos (o caminho padrão do Netlify)
        const respostaServidor = await fetch('/.netlify/functions/gerar-leitura', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pergunta: question,
                cartas: nomesDasCartas
            })
        });

        const dados = await respostaServidor.json();

        if (!respostaServidor.ok) {
            throw new Error(dados.erro || "Falha na comunicação espiritual.");
        }

        // Exibimos a resposta mágica da Inteligência Artificial
        setTimeout(() => {
            // A resposta do Gemini costuma vir com quebras de linha duplas (\n\n), 
            // substituímos por parágrafos no HTML para ficar bonito
            const leituraFormatada = dados.leitura.replace(/\n\n/g, '</p><p>');

            readingText.innerHTML = `
                <p><strong>Sua Pergunta:</strong> "${question}"</p>
                <p><strong>Cartas Sorteadas:</strong> ${nomesDasCartas}</p>
                <hr style="border: 0; border-top: 1px solid rgba(255,215,0,0.2); margin: 20px 0;">
                <p>${leituraFormatada}</p>
            `;
            readingResult.classList.remove('hidden');
            btnDraw.innerText = "Cartas Reveladas!";
        }, 1500);

    } catch (erro) {
        alert("Ops! Houve um problema ao consultar o oráculo: " + erro.message);
        btnDraw.disabled = false;
        btnDraw.innerText = "Tentar Novamente";
    }
});

btnReset.addEventListener('click', () => {
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`card-${i}`).classList.remove('flipped');
    }
    inputQuestion.value = "";
    readingResult.classList.add('hidden');
    btnDraw.disabled = false;
    btnDraw.innerText = "Mentalizar e Jogar (R$ 1,00)";
});
