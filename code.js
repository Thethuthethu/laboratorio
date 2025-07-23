// Funções e variáveis originais (sem alterações)
function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

function generateRandomNumber() {
    return Math.floor(Math.random() * 451) + 50;
}

function updateTargetNumber(newNumber) {
    const targetElement = document.getElementById('targetNumber');
    targetElement.textContent = newNumber;
    return newNumber;
}

function addToHistory(prime, result) {
    const historyContainer = document.getElementById('historyContainer');
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.textContent = `÷ ${prime} = ${result}`;
    historyContainer.prepend(historyItem);
}

function clearHistory() {
    document.getElementById('historyContainer').innerHTML = '';
}

const primes = [];
for (let i = 2; i <= 100; i++) {
    if (isPrime(i)) {
        primes.push(i);
    }
}

let currentNumber = 210;
let fatoresPrimos = []; // Array para armazenar os fatores usados na decomposição
const container = document.getElementById('numbersContainer');

primes.forEach(prime => {
    const numberDiv = document.createElement('div');
    numberDiv.className = 'number';
    numberDiv.textContent = prime;
    numberDiv.setAttribute('data-value', prime);
    numberDiv.draggable = true;
    container.appendChild(numberDiv);
});

function scrollNumbers(amount) {
    container.scrollBy({ left: amount, behavior: 'smooth' });
}

container.addEventListener('wheel', (e) => {
    e.preventDefault();
    container.scrollBy({ left: e.deltaY < 0 ? -100 : 100, behavior: 'smooth' });
});

const dropArea = document.getElementById('dropArea');
let draggedElement = null;

const message = document.createElement('div');
message.className = 'message';
document.body.appendChild(message);

// Função para processar a lógica do 'drop'
function handleDrop(primeValue) {
    const current = currentNumber;

    if (current % primeValue === 0) {
        const result = current / primeValue;
        currentNumber = result;
        updateTargetNumber(result);
        addToHistory(primeValue, result);
        
        // NOVO: Adiciona o fator primo ao array
        fatoresPrimos.push(primeValue);
        
        // NOVO: Destaca visualmente o primo usado
        draggedElement.classList.add('used');

        dropArea.innerHTML = `<div class="dropped-number">${primeValue}</div>`;
        message.textContent = `Dividido por ${primeValue}! Resultado: ${result}`;
        message.classList.add('show');

        if (result === 1 || result === 0) {
            setTimeout(() => {
                // NOVO: Mostra a decomposição completa antes de resetar
                message.textContent = `Decomposição: ${fatoresPrimos.join(" × ")}`;
                message.classList.add('show');
                
                setTimeout(() => {
                    message.textContent = "Decomposição completa! Gerando novo número...";
                    
                    setTimeout(() => {
                        const newNumber = generateRandomNumber();
                        currentNumber = updateTargetNumber(newNumber);
                        clearHistory();
                        dropArea.innerHTML = '<div class="placeholder">Solte o número aqui!</div>';
                        message.classList.remove('show');
                        
                        // NOVO: Resetar variáveis para novo número
                        fatoresPrimos = [];
                        document.querySelectorAll('.number.used').forEach(el => {
                            el.classList.remove('used');
                        });
                    }, 2000);
                }, 2000);
            }, 1500);
        } else {
            setTimeout(() => {
                message.classList.remove('show');
            }, 2000);
        }
    } else {
        message.textContent = `${primeValue} não é divisor de ${current}!`;
        message.classList.add('show');
        setTimeout(() => {
            message.classList.remove('show');
        }, 2000);
    }
}

// Lógica de Drag and Drop para DESKTOP (Mouse)
document.querySelectorAll('.number').forEach(number => {
    number.addEventListener('dragstart', function(e) {
        draggedElement = this;
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.getAttribute('data-value'));
    });

    number.addEventListener('dragend', function() {
        this.classList.remove('dragging');
        draggedElement = null;
    });
});

dropArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('active');
});

dropArea.addEventListener('dragleave', function() {
    this.classList.remove('active');
});

dropArea.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('active');
    if (draggedElement) {
        const primeValue = parseInt(draggedElement.getAttribute('data-value'));
        handleDrop(primeValue);
    }
});


// ####### LÓGICA PARA DISPOSITIVOS MÓVEIS (TOUCH) #######

let touchClone = null; // Elemento clone para feedback visual no toque

function moveTouchClone(e) {
    if (!touchClone) return;
    const touch = e.touches[0];
    touchClone.style.left = (touch.clientX - touchClone.offsetWidth / 2) + 'px';
    touchClone.style.top = (touch.clientY - touchClone.offsetHeight / 2) + 'px';
}

document.querySelectorAll('.number').forEach(number => {
    // Evento: quando o usuário TOCA no número
    number.addEventListener('touchstart', function(e) {
        draggedElement = this; // Define o elemento que está sendo arrastado
        this.classList.add('dragging');

        // Cria um clone para dar o feedback visual
        touchClone = this.cloneNode(true);
        touchClone.style.position = 'fixed';
        touchClone.style.zIndex = '1000';
        touchClone.style.pointerEvents = 'none'; // Impede o clone de interceptar eventos
        touchClone.style.opacity = '0.7';
        document.body.appendChild(touchClone);

        moveTouchClone(e); // Posiciona o clone inicial

        // Adiciona listeners para mover e soltar
        document.addEventListener('touchmove', handleTouchMove, { passive: false }); // Adicionado passive: false aqui também
        document.addEventListener('touchend', handleTouchEnd);
    }); // A OPÇÃO { passive: true } FOI REMOVIDA DAQUI
});

// Evento: quando o usuário MOVE o dedo na tela
function handleTouchMove(e) {
    if (!draggedElement) return;
    
    // Agora isso funciona sem erro, pois o listener não é mais passivo
    e.preventDefault();
    
    moveTouchClone(e); // Move o clone com o dedo

    const touch = e.touches[0];
    // Verifica se o dedo está sobre a área de drop
    const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);

    if (elementUnderTouch === dropArea || dropArea.contains(elementUnderTouch)) {
        dropArea.classList.add('active');
    } else {
        dropArea.classList.remove('active');
    }
}

// Evento: quando o usuário SOLTA o dedo da tela
function handleTouchEnd(e) {
    if (!draggedElement) return;

    // Limpeza visual
    draggedElement.classList.remove('dragging');
    dropArea.classList.remove('active');
    if (touchClone) {
        touchClone.remove(); // Remove o clone
        touchClone = null;
    }

    const touch = e.changedTouches[0];
    // Verifica qual elemento está sob o ponto onde o dedo foi solto
    const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);

    // Se soltou sobre a dropArea, processa a lógica
    if (elementUnderTouch === dropArea || dropArea.contains(elementUnderTouch)) {
        const primeValue = parseInt(draggedElement.getAttribute('data-value'));
        handleDrop(primeValue);
    }
    
    // Reseta e remove os listeners
    draggedElement = null;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
}

// Inicializa com um número aleatório
document.addEventListener('DOMContentLoaded', () => {
    const initialNumber = generateRandomNumber();
    currentNumber = updateTargetNumber(initialNumber);
    fatoresPrimos = [];
});

// =============== Modal Saiba Mais ===============
const modal = document.getElementById("infoModal");
const btn = document.getElementById("saibaMaisBtn");
const span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Fechar com ESC
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    modal.style.display = "none";
  }
});