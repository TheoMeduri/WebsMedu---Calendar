// Inicializar Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBW8zHAYBcPXaAQVbWlRfJhvJavuZOyBPg",
    authDomain: "websmedu-4afae.firebaseapp.com",
    projectId: "websmedu-4afae",
    storageBucket: "websmedu-4afae.firebasestorage.app",
    messagingSenderId: "567445669677",
    appId: "1:567445669677:web:d447f799a086908579b5a4"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let selectedDay = null;

async function generateCalendar() {
    const loadingModal = document.getElementById('loading-modal');
    loadingModal.style.display = 'flex'; // Exibe o modal de carregamento

    const calendar = document.getElementById('calendar');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    calendar.innerHTML = '';

    // Adiciona células vazias antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day');
        calendar.appendChild(emptyCell);
    }

    // Verificar quais dias têm eventos
    const eventDays = await getEventDays(currentYear, currentMonth); // Obtém os dias que têm eventos no mês atual

    // Adiciona os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day');
        dayCell.textContent = day;

        // Se o dia tem eventos, adicionar o ponto
        if (eventDays.includes(day)) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dayCell.appendChild(dot);
        }

        // Adicionar evento de clique para carregar eventos do dia
        dayCell.addEventListener('click', () => {
            selectedDay = new Date(currentYear, currentMonth, day);
            loadEvents(selectedDay);
        });

        calendar.appendChild(dayCell);
    }

    // Esconde o modal de carregamento após 2 segundos
    setTimeout(() => {
        loadingModal.style.display = 'none';
    }, 2000);
}

// Função para buscar os dias com eventos
async function getEventDays(year, month) {
    const eventDays = [];

    try {
        const querySnapshot = await db.collection('events')
            .where('date', '>=', new Date(year, month, 1))  // Primeira data do mês
            .where('date', '<=', new Date(year, month + 1, 0))  // Última data do mês
            .get();

        querySnapshot.forEach((doc) => {
            const event = doc.data();
            const eventDate = new Date(event.date.seconds * 1000);
            if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                eventDays.push(eventDate.getDate()); // Adiciona o dia do evento
            }
        });
    } catch (error) {
        console.error("Erro ao buscar dias de eventos:", error);
    }

    return eventDays;
}

// Função para abrir o modal
const addEventBtn = document.getElementById('add-event-btn');
const eventModal = document.getElementById('event-modal');
const modalOverlay = document.getElementById('modal-overlay');

// Abrir modal quando o botão "Adicionar Evento" for clicado
addEventBtn.addEventListener('click', () => {
    eventModal.style.display = 'block';
    modalOverlay.style.display = 'block';
});

// Fechar o modal ao clicar no overlay
modalOverlay.addEventListener('click', () => {
    eventModal.style.display = 'none';
    modalOverlay.style.display = 'none';
});

// Adicionar evento
document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('event-title').value;
    const description = document.getElementById('event-description').value;
    const date = document.getElementById('event-date').value; // Aqui pegamos a data do input datetime-local

    // Extrair o UID da URL
    const urlParams = new URLSearchParams(window.location.search);
    const uidFromUrl = urlParams.get('uid'); // Obtém o valor do parâmetro 'uid'

    if (!uidFromUrl) {
        alert("UID não encontrado na URL!");
        return;
    }

    if (title && date && uidFromUrl) {
        const eventDate = new Date(date); // Converte o valor do input para um objeto Date

        // Adiciona o evento no Firestore com o UID extraído
        await db.collection('events').add({
            title,
            description,
            date: eventDate,
            createdBy: uidFromUrl, // Usa o UID extraído da URL
            day: eventDate.toDateString() // Usa a data do evento para armazenar o "dia"
        });

        // Atualiza o calendário
        generateCalendar();

        // Fecha o modal e reseta o formulário
        document.getElementById('event-form').reset();
        eventModal.style.display = 'none';
        modalOverlay.style.display = 'none';

        // Atualiza os eventos para o dia selecionado
        if (selectedDay) {
            loadEvents(selectedDay);
        }
    }
});

// Função para fazer login com o UID da URL
async function loginWithUid() {
    const urlParams = new URLSearchParams(window.location.search);
    const uidFromUrl = urlParams.get('uid');

    if (!uidFromUrl) {
        alert('UID não encontrado na URL!');
        return;
    }

    try {
        // Recuperar dados do usuário com o UID, por exemplo, do Firestore
        const userDoc = await db.collection('users').doc(uidFromUrl).get();
        
        if (!userDoc.exists) {
            alert("Usuário não encontrado!");
            return;
        }

        // Suponha que você tenha um email do usuário salvo no Firestore
        const email = userDoc.data().email;

        // Agora, você pode autenticar o usuário com esse email
        await auth.signInWithEmailAndPassword(email, 'SENHA_TEMPORARIA'); // Substitua a senha com a apropriada, se necessário

        alert('Usuário autenticado com sucesso!');
        generateCalendar(); // Gerar o calendário após o login

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        alert("Erro ao autenticar usuário!");
    }
}

// Chama a função de login com UID da URL
loginWithUid();

// Inicializar calendário e verificar autenticação
auth.onAuthStateChanged((user) => {
    if (user) {
        // Usuário autenticado, gerar o calendário
        generateCalendar();
    } else {
        // Usuário não autenticado, redirecionar para página de login
        alert('Por favor, faça login para acessar a agenda.');
        window.location.href = 'https://websmedu.com.br/server/signin.html?href=https://calendar.websmedu.com.br/';
    }
});
