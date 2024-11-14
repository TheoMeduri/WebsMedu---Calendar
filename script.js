const countdown = document.getElementById('countdown');
const statusMessages = document.querySelectorAll('.status-message');

// Define a data de destino
const targetDate = new Date('2024-12-10T00:00:00');

// Função de contagem regressiva
function startCountdown() {
  const interval = setInterval(() => {
    const now = new Date();
    const timeRemaining = targetDate - now;

    if (timeRemaining <= 0) {
      clearInterval(interval);
      countdown.textContent = "A manutenção foi concluída!";
      return;
    }
// Calcula os dias, horas, minutos e segundos restantes
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    countdown.textContent = `Faltam ${days}d ${hours}h ${minutes}m ${seconds}s para a conclusão.`;
  }, 1000);
}

// Função de alternância das mensagens
function startCarousel() {
  let index = 0;
  setInterval(() => {
    statusMessages.forEach(msg => msg.classList.remove('active'));
    statusMessages[index].classList.add('active');
    index = (index + 1) % statusMessages.length;
  }, 3000);
}

startCountdown();
startCarousel();
