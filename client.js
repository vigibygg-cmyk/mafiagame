const socket = io('https://mafia-muw1.onrender.com');

let myRole = null;
let myStatus = true; // isAlive
let currentPhase = 'LOBBY';

function joinGame() {
    const name = document.getElementById('playerName').value.trim();
    if (name === '') {
        alert('Įveskite vardą.');
        return;
    }
    socket.emit('join_game', name);
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'block';
}

function requestGameStart() {
    socket.emit('start_game');
}

socket.on('update_players', (players) => {
    const list = document.getElementById('playersList');
    list.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name;
        list.appendChild(li);
    });
});

socket.on('error_message', (msg) => {
    alert(msg);
});

// Fazių valdymas ir sąsajos atnaujinimas
socket.on('phase_change', (data) => {
    currentPhase = data.phase;
    document.getElementById('lobby-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';

    if (data.role) myRole = data.role;
    if (data.isAlive !== undefined) myStatus = data.isAlive;

    document.getElementById('roleDisplay').textContent = 'Tavo vaidmuo: ' + (myRole || 'Nežinomas');

    const statusMsg = document.getElementById('statusMessage');
    const title = document.getElementById('phaseTitle');

    if (currentPhase === 'NIGHT') {
        title.textContent = '🌙 Naktis';
        if (!myStatus) {
            statusMsg.textContent = 'Jūs esate miręs. Galite tik stebėti.';
        } else if (myRole === 'MAFIJA') {
            statusMsg.textContent = 'Pasirinkite, ką norite nužudyti:';
        } else if (myRole === 'DAKTARAS') {
            statusMsg.textContent = 'Pasirinkite, ką norite išgydyti:';
        } else if (myRole === 'DETEKTYVAS') {
            statusMsg.textContent = 'Pasirinkite, ką norite patikrinti:';
        } else {
            statusMsg.textContent = 'Miestas miega... Laukite ryto.';
        }
    } else if (currentPhase === 'DAY_VOTING') {
        title.textContent = '☀️ Diena ir Balsavimas';
        let txt = data.killedPlayer ? `Šią naktį buvo nužudytas: ${data.killedPlayer}.` : 'Naktis praėjo ramiai, niekas nemirė.';
        statusMsg.textContent = txt + ' Atiduokite savo balsą, kas yra Mafija:';
    }

    renderGamePlayers(data.players);
});

socket.on('detective_result', (res) => {
    alert(`Detektyvo ataskaita: Žaidėjas ${res.targetName} yra ${res.isMafia ? 'MAFIJA!' : 'TAIKUS CIVILIS.'}`);
});

function renderGamePlayers(players) {
    const list = document.getElementById('gamePlayersList');
    list.innerHTML = '';

    players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.name + (p.isAlive ? '' : ' 💀 (Miręs)');
        if (!p.isAlive) li.classList.add('dead');

        // Veiksmų mygtukai gyviems žaidėjams
        if (myStatus && p.isAlive) {
            if (currentPhase === 'NIGHT' && (myRole === 'MAFIJA' || myRole === 'DAKTARAS' || myRole === 'DETEKTYVAS')) {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.textContent = 'Pasirinkti';
                btn.onclick = () => socket.emit('night_action', p.id);
                li.appendChild(btn);
            } else if (currentPhase === 'DAY_VOTING') {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.textContent = 'Balsuoti';
                btn.onclick = () => socket.emit('cast_vote', p.id);
                li.appendChild(btn);
            }
        }

        list.appendChild(li);
    });
}
