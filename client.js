const socket = io('https://mafia-muw1.onrender.com');

let myRole = null;
let myStatus = true;
let amIHost = false;
let currentPhase = 'LOBBY';
let currentLang = 'lt';

const I18N = {
    lt: {
        btn_help: "Pagalba", title_login: "Prisijungti", btn_create: "Sukurti naują kambarį (Tapti Hostu)",
        btn_join: "Prisijungti prie esamo kambario", title_lobby: "Laukiamasis", lbl_room: "Kambarys",
        lbl_players: "Prisijungę žaidėjai:", btn_start: "Pradėti žaidimą (min 6)", msg_wait_host: "Laukiama, kol Hostas pradės žaidimą...",
        lbl_citizens: "Miesto gyventojai:", title_game_over: "Žaidimas baigėsi!", btn_play_again: "Žaisti dar kartą šiame kambaryje",
        btn_leave: "Išeiti iš kambario į pradinį meniu", btn_reset: "Ištrinti kambarį visiems (RESET)", help_title: "Taisyklės",
        ph_name: "Įvesk savo vardą", ph_room: "Įvesk kambario kodą",
        ROLE_MAFIA: "Mafija", ROLE_DETECTIVE: "Detektyvas", ROLE_DOCTOR: "Daktaras", ROLE_CITIZEN: "Miestietis",
        ROLE_UNKNOWN: "Nežinomas",
        WIN_MAFIA: "Laimėjo MAFIJA!", WIN_CITIZENS: "Laimėjo TAIKŪS GYVENTOJAI!",
        PHASE_NIGHT: "🌙 Naktis", PHASE_DAY: "☀️ Diena ir Balsavimas",
        MSG_DEAD: "Jūs esate miręs. Galite tik stebėti.", MSG_MAFIA_ACTION: "Pasirinkite auką:",
        MSG_DOCTOR_ACTION: "Pasirinkite, ką gydyti:", MSG_DETECTIVE_ACTION: "Pasirinkite, ką patikrinti:",
        MSG_SLEEP: "Miestas miega...", MSG_DAY_NO_DEATH: "Naktis praėjo ramiai.",
        MSG_DAY_DEATH: "Šią naktį nužudytas:", MSG_VOTE: "Balsuokite, kas yra Mafija:",
        BTN_SELECT: "Pasirinkti", BTN_SELECTED: "Pasirinkta", BTN_VOTE: "Balsuoti", BTN_VOTED: "Pabalsuota",
        ALERT_DETECT_MAFIA: "Detektyvo ataskaita: Žaidėjas yra MAFIJA!",
        ALERT_DETECT_CITIZEN: "Detektyvo ataskaita: Žaidėjas yra TAIKUS.",
        ERR_ROOM_NOT_FOUND: "Kambarys nerastas. Patikrinkite kodą.", ERR_ALREADY_STARTED: "Žaidimas jau vyksta šiam kambaryje.",
        ERR_NOT_HOST: "Tik šeimininkas (Host) gali tai padaryti.", ERR_NEED_6: "Trūksta žaidėjų (min 6).",
        ERR_NOT_HOST_RESET: "Tik šeimininkas gali ištrinti kambarį.",
        CONFIRM_RESET: "Ar tikrai ištrinti kambarį visiems žaidėjams?", MSG_ROOM_DELETED: "Kambarys buvo ištrintas Hosto arba dėl neveiklumo.",
        HELP_TEXT: "<b>Vaidmenys:</b><br>- Mafija: Naktį pasirenka auką.<br>- Daktaras: Naktį pasirenka vieną žaidėją, kurį išgydys.<br>- Detektyvas: Naktį patikrina vieno žaidėjo tapatybę.<br>- Miestietis: Dienos metu balsuoja, kas yra mafija.<br><br><b>Eiga:</b> Naktį specialūs vaidmenys atlieka veiksmus. Dieną paskelbiami rezultatai ir atliekamas atviras balsavimas."
    },
    en: {
        btn_help: "Help", title_login: "Join Game", btn_create: "Create New Room (Become Host)",
        btn_join: "Join Existing Room", title_lobby: "Lobby", lbl_room: "Room",
        lbl_players: "Connected Players:", btn_start: "Start Game (min 6)", msg_wait_host: "Waiting for host to start...",
        lbl_citizens: "Citizens:", title_game_over: "Game Over!", btn_play_again: "Play Again in this room",
        btn_leave: "Leave room to Main Menu", btn_reset: "Delete room for everyone (RESET)", help_title: "Rules",
        ph_name: "Enter your name", ph_room: "Enter room code",
        ROLE_MAFIA: "Mafia", ROLE_DETECTIVE: "Detective", ROLE_DOCTOR: "Doctor", ROLE_CITIZEN: "Citizen",
        ROLE_UNKNOWN: "Unknown",
        WIN_MAFIA: "MAFIA Wins!", WIN_CITIZENS: "CITIZENS Win!",
        PHASE_NIGHT: "🌙 Night", PHASE_DAY: "☀️ Day & Voting",
        MSG_DEAD: "You are dead. Spectate only.", MSG_MAFIA_ACTION: "Select someone to kill:",
        MSG_DOCTOR_ACTION: "Select someone to heal:", MSG_DETECTIVE_ACTION: "Select someone to investigate:",
        MSG_SLEEP: "The city sleeps...", MSG_DAY_NO_DEATH: "Peaceful night, no one died.",
        MSG_DAY_DEATH: "Killed tonight:", MSG_VOTE: "Vote for the Mafia:",
        BTN_SELECT: "Select", BTN_SELECTED: "Selected", BTN_VOTE: "Vote", BTN_VOTED: "Voted",
        ALERT_DETECT_MAFIA: "Detective Report: Player is MAFIA!",
        ALERT_DETECT_CITIZEN: "Detective Report: Player is INNOCENT.",
        ERR_ROOM_NOT_FOUND: "Room not found. Check the code.", ERR_ALREADY_STARTED: "Game already started.",
        ERR_NOT_HOST: "Only Host can do this.", ERR_NEED_6: "Not enough players (min 6).",
        ERR_NOT_HOST_RESET: "Only Host can delete the room.",
        CONFIRM_RESET: "Delete room for everyone?", MSG_ROOM_DELETED: "Room has been deleted by Host or due to inactivity.",
        HELP_TEXT: "<b>Roles:</b><br>- Mafia: Kills at night.<br>- Doctor: Protects at night.<br>- Detective: Checks roles at night.<br>- Citizen: Votes during the day.<br><br><b>Flow:</b> Night actions -> Day results -> Voting to eliminate a suspect."
    },
    no: {
        btn_help: "Hjelp", title_login: "Bli med", btn_create: "Opprett nytt rom (Bli Vert)",
        btn_join: "Bli med i eksisterende rom", title_lobby: "Lobby", lbl_room: "Rom",
        lbl_players: "Tilkoblede spillere:", btn_start: "Start spill (min 6)", msg_wait_host: "Venter på vert...",
        lbl_citizens: "Innbyggere:", title_game_over: "Spillet er over!", btn_play_again: "Spill igjen i dette rommet",
        btn_leave: "Forlat rommet til Hovedmenyen", btn_reset: "Slett rom for alle (RESET)", help_title: "Regler",
        ph_name: "Skriv inn navnet ditt", ph_room: "Skriv inn romkode",
        ROLE_MAFIA: "Mafia", ROLE_DETECTIVE: "Detektiv", ROLE_DOCTOR: "Doktor", ROLE_CITIZEN: "Innbygger",
        ROLE_UNKNOWN: "Ukjent",
        WIN_MAFIA: "MAFIA Vinner!", WIN_CITIZENS: "INNBYGGERNE Vinner!",
        PHASE_NIGHT: "🌙 Natt", PHASE_DAY: "☀️ Dag & Avstemning",
        MSG_DEAD: "Du er død. Du kan bare se på.", MSG_MAFIA_ACTION: "Velg hvem du vil drepe:",
        MSG_DOCTOR_ACTION: "Velg hvem du vil beskytte:", MSG_DETECTIVE_ACTION: "Velg hvem du vil etterforske:",
        MSG_SLEEP: "Byen sover...", MSG_DAY_NO_DEATH: "Fredelig natt, ingen døde.",
        MSG_DAY_DEATH: "Drept i natt:", MSG_VOTE: "Stem på Mafiaen:",
        BTN_SELECT: "Velg", BTN_SELECTED: "Valgt", BTN_VOTE: "Stemme", BTN_VOTED: "Har stemt",
        ALERT_DETECT_MAFIA: "Detektivrapport: Spilleren er MAFIA!",
        ALERT_DETECT_CITIZEN: "Detektivrapport: Spilleren er USKYLDIG.",
        ERR_ROOM_NOT_FOUND: "Rom ikke funnet. Sjekk koden.", ERR_ALREADY_STARTED: "Spillet har allerede startet.",
        ERR_NOT_HOST: "Bare verten (Host) kan gjøre dette.", ERR_NEED_6: "Ikke nok spillere (min 6).",
        ERR_NOT_HOST_RESET: "Bare verten kan slette rommet.",
        CONFIRM_RESET: "Er du sikker på at du vil slette rommet for alle?", MSG_ROOM_DELETED: "Rommet er slettet av verten eller pga. inaktivitet.",
        HELP_TEXT: "<b>Roller:</b><br>- Mafia: Dreper om natten.<br>- Doktor: Beskytter en spiller om natten.<br>- Detektiv: Sjekker rollen til en spiller.<br>- Innbygger: Stemmer om dagen for å kaste ut mafiaen.<br><br><b>Forløp:</b> Spesialroller handler om natten. Om dagen diskuteres resultatene og det stemmes over hvem som er mistenkt."
    }
};

function t(key) {
    return I18N[currentLang][key] || key;
}

function changeLanguage() {
    currentLang = document.getElementById('langSelect').value;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-ph'));
    });
    document.getElementById('helpContent').innerHTML = t('HELP_TEXT');
    if (myRole) document.getElementById('roleDisplay').textContent = t(myRole);
    if (currentPhase === 'NIGHT' || currentPhase === 'DAY_VOTING') {
        const fakeData = { phase: currentPhase };
        updatePhaseUI(fakeData, false);
    }
}

function openHelp() { document.getElementById('helpModal').style.display = 'block'; }
function closeHelp() { document.getElementById('helpModal').style.display = 'none'; }

window.onload = () => {
    changeLanguage(); 
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
    if (name === '') return alert(t('ph_name') + '!');
    sessionStorage.setItem('mafia_player_name', name);
    socket.emit('join_game', { playerName: name, roomCode: null });
}

function joinRoom() {
    const name = document.getElementById('playerName').value.trim();
    const roomCode = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if (name === '') return alert(t('ph_name') + '!');
    if (roomCode === '') return alert(t('ph_room') + '!');
    sessionStorage.setItem('mafia_player_name', name);
    socket.emit('join_game', { playerName: name, roomCode: roomCode });
}

function requestGameStart() { socket.emit('start_game'); }

function playAgain() { socket.emit('play_again'); }

function resetGame() {
    if (confirm(t('CONFIRM_RESET'))) socket.emit('reset_game');
}

function leaveRoom() {
    sessionStorage.removeItem('mafia_player_name');
    sessionStorage.removeItem('mafia_room_code');
    socket.emit('leave_room');
    location.reload();
}

function updateHostUI(players) {
    const myName = sessionStorage.getItem('mafia_player_name');
    const me = players.find(p => p.name.toLowerCase() === (myName ? myName.toLowerCase() : ''));
    amIHost = me ? me.isHost : false;

    document.getElementById('startGameBtn').style.display = amIHost ? 'block' : 'none';
    document.getElementById('resetRoomBtn').style.display = amIHost ? 'block' : 'none';
    document.getElementById('waitingHostMsg').style.display = amIHost ? 'none' : 'block';
    document.getElementById('playAgainBtn').style.display = amIHost ? 'block' : 'none';
}

socket.on('update_players', (data) => {
    sessionStorage.setItem('mafia_room_code', data.roomCode);
    document.getElementById('displayRoomCode').textContent = data.roomCode;

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('summary-screen').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'block';
    document.getElementById('leaveRoomBtn').style.display = 'block';

    updateHostUI(data.players);

    const list = document.getElementById('playersList');
    list.innerHTML = '';
    data.players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name;
        if (player.isHost) {
            const badge = document.createElement('span');
            badge.className = 'host-badge';
            badge.textContent = 'HOST';
            li.appendChild(badge);
        }
        list.appendChild(li);
    });
});

socket.on('error_message', (msgCode) => {
    alert(t(msgCode));
});

function updatePhaseUI(data, isFullUpdate = true) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'none';
    document.getElementById('summary-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    if (isFullUpdate) {
        document.getElementById('displayGameRoomCode').textContent = data.roomCode;
        updateHostUI(data.players);
        if (data.role) myRole = data.role;
        if (data.isAlive !== undefined) myStatus = data.isAlive;
    }

    document.getElementById('roleDisplay').textContent = t(myRole || 'ROLE_UNKNOWN');

    const statusMsg = document.getElementById('statusMessage');
    const title = document.getElementById('phaseTitle');

    if (currentPhase === 'NIGHT') {
        title.textContent = t('PHASE_NIGHT');
        if (!myStatus) statusMsg.textContent = t('MSG_DEAD');
        else if (myRole === 'ROLE_MAFIA') statusMsg.textContent = t('MSG_MAFIA_ACTION');
        else if (myRole === 'ROLE_DOCTOR') statusMsg.textContent = t('MSG_DOCTOR_ACTION');
        else if (myRole === 'ROLE_DETECTIVE') statusMsg.textContent = t('MSG_DETECTIVE_ACTION');
        else statusMsg.textContent = t('MSG_SLEEP');
    } else if (currentPhase === 'DAY_VOTING') {
        title.textContent = t('PHASE_DAY');
        let txt = data.killedPlayer ? `${t('MSG_DAY_DEATH')} ${data.killedPlayer}.` : t('MSG_DAY_NO_DEATH');
        statusMsg.textContent = txt + ' ' + t('MSG_VOTE');
    }
}

socket.on('phase_change', (data) => {
    currentPhase = data.phase;
    sessionStorage.setItem('mafia_room_code', data.roomCode);
    updatePhaseUI(data);
    renderGamePlayers(data.players);
});

socket.on('detective_result', (res) => {
    alert(res.isMafia ? t('ALERT_DETECT_MAFIA') : t('ALERT_DETECT_CITIZEN'));
});

socket.on('game_over', (data) => {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('summary-screen').style.display = 'block';
    
    document.getElementById('winnerText').textContent = t(data.winner);
    
    const list = document.getElementById('summaryList');
    list.innerHTML = '';
    data.summary.forEach(p => {
        const li = document.createElement('li');
        li.className = 'summary-li';
        li.innerHTML = `<b>${p.name}</b> - ${t(p.role)} ${p.isAlive ? '' : '💀'}`;
        list.appendChild(li);
    });
});

socket.on('game_reset', (msgCode) => {
    if(msgCode) alert(t(msgCode));
    sessionStorage.removeItem('mafia_player_name');
    sessionStorage.removeItem('mafia_room_code');
    location.reload();
});

function renderGamePlayers(players) {
    const list = document.getElementById('gamePlayersList');
    list.innerHTML = '';
    players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.name + (p.isAlive ? '' : ' 💀');
        if (!p.isAlive) li.classList.add('dead');

        if (myStatus && p.isAlive) {
            if (currentPhase === 'NIGHT' && ['ROLE_MAFIA', 'ROLE_DOCTOR', 'ROLE_DETECTIVE'].includes(myRole)) {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.textContent = t('BTN_SELECT');
                btn.onclick = () => { socket.emit('night_action', p.id); btn.disabled = true; btn.textContent = t('BTN_SELECTED'); };
                li.appendChild(btn);
            } else if (currentPhase === 'DAY_VOTING') {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.textContent = t('BTN_VOTE');
                btn.onclick = () => { socket.emit('cast_vote', p.id); btn.disabled = true; btn.textContent = t('BTN_VOTED'); };
                li.appendChild(btn);
            }
        }
        list.appendChild(li);
    });
}
