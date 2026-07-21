const socket = io('https://mafia-muw1.onrender.com');

let myRole = null;
let myStatus = true;
let currentPhase = 'LOBBY';

window.onload = () => {
    const savedName = sessionStorage.getItem('mafia_player_name');
    const savedRoom = sessionStorage.getItem('mafia_room_code');
    
    if (savedName && savedRoom) {
        document.getElementById('playerName').value = savedName;
        document.getElementById('roomCodeInput').value = savedRoom;
        socket.emit('join_game', { playerName: savedName, roomCode: savedRoom });
    }
};

function createRoom() {
    const name = document.getElementById('playerName').value.trim();
    if (name === '') {
        alert('Įveskite savo vardą!');
        return;
    }
    sessionStorage.setItem('mafia_player_name', name);
    // Siunčiame tuščią roomCode, kad serveris sugeneruotų naują kambarį
    socket.emit('join_game', { playerName: name, roomCode: null });
}

function joinRoom() {
    const name = document.getElementById('playerName').value.trim();
    const roomCode = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    
    if (name === '') {
        alert('Įveskite savo vardą!');
        return;
    }
    if (roomCode === '') {
        alert('Įveskite kambario kodą!');
        return;
    }
    
    sessionStorage.setItem('mafia_player_name', name);
    socket.emit('join_game', { playerName: name, roomCode: roomCode });
}

function requestGameStart() {
    socket.emit('start_game');
}

function resetGame() {
    if (confirm('Ar tikrai norite atstatyti šį kambarį iš naujo?')) {
        sessionStorage.removeItem('mafia_player_name');
        sessionStorage.removeItem('mafia_room_code');
        socket.emit('reset_game');
    }
}

// Serveris atsiunčia atnaujintą žaidėjų sąrašą
socket.on('update_players', (data) => {
    sessionStorage.setItem('mafia_room_code', data.roomCode);
    document.getElementById('displayRoomCode').textContent = data.roomCode;

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'block';

    const list = document.getElementById('playersList');
    list.innerHTML = '';
    
    // Čia atvaizduojami visi prisijungę žaidėjai
    data.players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name;
        list.appendChild(li);
    });
});

socket.on('error_message', (msg) => {
    alert('KLAIDA: ' + msg);
});

socket.on('phase_change', (data) => {
    currentPhase = data.phase;
    sessionStorage.setItem('mafia_room_code', data.roomCode);
    
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';

    document.getElementById('displayGameRoomCode').textContent = data.roomCode;

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

socket.on('game_over', (data) => {
    alert(`ŽAIDIMAS BAIGĖSI! Laimėjo: ${data.winner}`);
    sessionStorage.removeItem('mafia_player_name');
    sessionStorage.removeItem('mafia_room_code');
    location.reload();
});

socket.on('game_reset', () => {
    alert('Kambarys buvo išvalytas arba žaidimas atstatytas iš naujo.');
    sessionStorage.removeItem('mafia_player_name');
    sessionStorage.removeItem('mafia_room_code');
    location.reload();
});

function renderGamePlayers(players) {
    const list = document.getElementById('gamePlayersList');
    list.innerHTML = '';

    players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.name + (p.isAlive ? '' : ' 💀 (Miręs)');
        if (!p.isAlive) li.classList.add('dead');

        if (myStatus && p.isAlive) {
            if (currentPhase === 'NIGHT' && (myRole === 'MAFIJA' || myRole === 'DAKTARAS' || myRole === 'DETEKTYVAS')) {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.textContent = 'Pasirinkti';
                btn.onclick = () => {
                    socket.emit('night_action', p.id);
                    btn.disabled = true;
                    btn.textContent = 'Pasirinkta';
                };
                li.appendChild(btn);
            } else if (currentPhase === 'DAY_VOTING') {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.textContent = 'Balsuoti';
                btn.onclick = () => {
                    socket.emit('cast_vote', p.id);
                    btn.disabled = true;
                    btn.textContent = 'Pabalsuota';
                };
                li.appendChild(btn);
            }
        }

        list.appendChild(li);
    });
}
