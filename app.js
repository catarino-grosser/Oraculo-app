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

// Elementos do Pix
const inputSection = document.getElementById('input-section');
const paymentSection = document.getElementById('payment-section');
const qrCodeImg = document.getElementById('qr-code-img');
const pixCopiaCola = document.getElementById('pix-copia-cola');
const btnCopyPix = document.getElementById('btn-copy-pix');
const btnCancel = document.getElementById('btn-cancel-payment');

let paymentInterval; 

function getRandomCards(deck, num) {
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

// === SISTEMA DE MEMÓRIA: Verifica se há um Pix pendente ao abrir a página ===
document.addEventListener('DOMContentLoaded', () => {
    const pagamentoPendente = localStorage.getItem('tarot_sessao_pix');
    if (pagamentoPendente) {
        const dados = JSON.parse(pagamentoPendente);
        
        // Restaura a tela do Pix
        inputSection.classList.add('hidden');
        paymentSection.classList.remove('hidden');
        qrCodeImg.src = `data:image/png;base64,${dados.qr_code_base64}`;
        pixCopiaCola.value = dados.qr_code;
        
        // Retoma a verificação do banco
        paymentInterval = setInterval(() => checkPaymentStatus(dados.id, dados.question), 4000);
    }
});

btnDraw.addEventListener('click', async () => {
    const question = inputQuestion.value.trim();
    if (question === "") {
        alert("Por favor, digite sua pergunta antes de consultar as cartas.");
        return;
    }

    btnDraw.disabled = true;
    btnDraw.innerText = "Gerando cobrança mística...";

    try {
        const resPix = await fetch('/.netlify/functions/gerar-pix', { method: 'POST' });
        const pixData = await resPix.json();

        if (!resPix.ok) throw new Error(pixData.erro);

        // SALVA NA MEMÓRIA ANTES DE MOSTRAR NA TELA
        const sessao = {
            id: pixData.id,
            qr_code: pixData.qr_code,
            qr_code_base64: pixData.qr_code_base64,
            question: question
        };
        localStorage.setItem('tarot_sessao_pix', JSON.stringify(sessao));

        qrCodeImg.src = `data:image/png;base64,${pixData.qr_code_base64}`;
        pixCopiaCola.value = pixData.qr_code;
        
        inputSection.classList.add('hidden');
        paymentSection.classList.remove('hidden');

        paymentInterval = setInterval(() => checkPaymentStatus(pixData.id, question), 4000);

    } catch (erro) {
        alert("Erro ao gerar Pix: " + erro.message);
        btnDraw.disabled = false;
        btnDraw.innerText = "Mentalizar e Jogar (R$ 1,00)";
    }
});

async function checkPaymentStatus(paymentId, question) {
    try {
        const res = await fetch('/.netlify/functions/verificar-pix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
        });
        const data = await res.json();

        if (data.status === 'approved') {
            clearInterval(paymentInterval);
            localStorage.removeItem('tarot_sessao_pix'); // Limpa a memória pois já pagou!
            paymentSection.classList.add('hidden'); 
            iniciarLeitura(question); 
        }
    } catch (error) {
        console.error("A aguardar banco...");
    }
}

async function iniciarLeitura(question) {
    const selectedCards = getRandomCards(mockCardsDeck, 3);
    const nomesDasCartas = `${selectedCards[0].name}, ${selectedCards[1].name} e ${selectedCards[2].name}`;

    selectedCards.forEach((cardData, index) => {
        const cardElement = document.getElementById(`card-${index + 1}`);
        cardElement.querySelector('.card-title').innerText = cardData.name;
        cardElement.querySelector('.card-illustration').innerText = cardData.icon;
        setTimeout(() => { cardElement.classList.add('flipped'); }, index * 400);
    });

    try {
        const respostaServidor = await fetch('/.netlify/functions/gerar-leitura', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pergunta: question, cartas: nomesDasCartas })
        });
        const dados = await respostaServidor.json();
        
        if (!respostaServidor.ok) throw new Error(dados.erro);

        setTimeout(() => {
            const leituraFormatada = dados.leitura.replace(/\n\n/g, '</p><p>');
            readingText.innerHTML = `
                <p><strong>Sua Pergunta:</strong> "${question}"</p>
                <p><strong>Cartas:</strong> ${nomesDasCartas}</p>
                <hr style="border: 0; border-top: 1px solid rgba(255,215,0,0.2); margin: 20px 0;">
                <p>${leituraFormatada}</p>
            `;
            readingResult.classList.remove('hidden');
        }, 1500);

    } catch (erro) {
        alert("O pagamento foi recebido, mas houve um erro na IA: " + erro.message);
    }
}

btnCopyPix.addEventListener('click', () => {
    pixCopiaCola.select();
    document.execCommand('copy');
    btnCopyPix.innerText = "Copiado!";
    setTimeout(() => { btnCopyPix.innerText = "Copiar Código Pix"; }, 2000);
});

btnCancel.addEventListener('click', () => {
    clearInterval(paymentInterval);
    localStorage.removeItem('tarot_sessao_pix'); // Limpa a memória ao cancelar
    paymentSection.classList.add('hidden');
    inputSection.classList.remove('hidden');
    btnDraw.disabled = false;
    btnDraw.innerText = "Mentalizar e Jogar (R$ 1,00)";
});

btnReset.addEventListener('click', () => {
    for (let i = 1; i <= 3; i++) document.getElementById(`card-${i}`).classList.remove('flipped');
    inputQuestion.value = "";
    readingResult.classList.add('hidden');
    inputSection.classList.remove('hidden');
    btnDraw.disabled = false;
    btnDraw.innerText = "Mentalizar e Jogar (R$ 1,00)";
});
// === LÓGICA DO MODAL "COMO FUNCIONA" ===
const btnInfo = document.getElementById('btn-info');
const infoModal = document.getElementById('info-modal');
const closeModal = document.getElementById('close-modal');

// Abre o Modal
btnInfo.addEventListener('click', () => {
    infoModal.classList.remove('hidden');
});

// Fecha o Modal clicando no X
closeModal.addEventListener('click', () => {
    infoModal.classList.add('hidden');
});

// Fecha o Modal clicando na parte escura fora da caixa
window.addEventListener('click', (evento) => {
    if (evento.target === infoModal) {
        infoModal.classList.add('hidden');
    }
});
// ========================================
