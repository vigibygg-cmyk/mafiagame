const socket = io('https://mafia-muw1.onrender.com');

let myRole = null;
let myStatus = true;
let amIHost = false;
let currentPhase = 'LOBBY';
let currentLang = 'en';
let mafiaVotesMap = {};

const I18N = {
    lt: {
        GAME_TITLE: "Mafija Online",
        btn_help: "Pagalba", title_login: "Prisijungti", btn_create: "Sukurti naują kambarį (Tapti Hostu)",
        btn_join: "Prisijungti prie esamo kambario", title_lobby: "Laukiamasis", lbl_room: "Kambarys",
        lbl_players: "Prisijungę žaidėjai:", btn_start: "Pradėti žaidimą (min 6)", msg_wait_host: "Laukiama, kol Hostas pradės žaidimą...",
        lbl_citizens: "Miesto gyventojai:", title_game_over: "Žaidimas baigėsi!", btn_play_again: "Žaisti dar kartą šiame kambaryje",
        btn_leave: "Išeiti iš kambario į pradinį meniu", btn_reset: "Ištrinti kambarį visiems (RESET)", help_title: "Taisyklės ir Eiga",
        ph_name: "Įvesk savo vardą", ph_room: "Įvesk kambario kodą",
        ROLE_MAFIA: "Mafija", ROLE_DETECTIVE: "Detektyvas", ROLE_DOCTOR: "Medikas", ROLE_CITIZEN: "Miestietis",
        ROLE_UNKNOWN: "Nežinomas", WIN_MAFIA: "Laimėjo MAFIJA!", WIN_CITIZENS: "Laimėjo TAIKŪS GYVENTOJAI!",
        PHASE_NIGHT: "🌙 Naktis", PHASE_DAY: "☀️ Diena (Nominavimas)", PHASE_DEFENSE: "⚖️ Gynybinė kalba ir teismas",
        MSG_DEAD: "Jūs esate miręs. Galite tik stebėti.", MSG_MAFIA_ACTION: "Tyliai išsirinkite auką su kitais mafiozais:",
        MSG_DOCTOR_ACTION: "Pasirinkite, ką gydyti:", MSG_DETECTIVE_ACTION: "Pasirinkite, ką patikrinti:",
        MSG_CITIZEN_ACTION: "Patruliuokite (Spaudinėkite ekrane kamufliažui):", MSG_DAY_NO_DEATH: "Naktis praėjo ramiai.",
        MSG_DAY_DEATH: "Šią naktį nužudytas:", MSG_VOTE: "Balsuokite, kas kelia įtarimų:",
        BTN_SELECT: "Pasirinkti", BTN_SELECTED: "Pasirinkta", BTN_VOTE: "Balsuoti", BTN_VOTED: "Pabalsuota",
        BTN_PATROL: "Stebėti", BTN_PATROLLED: "Patikrinta",
        ALERT_DETECT_MAFIA: "Detektyvo ataskaita: Žaidėjas yra MAFIJA!", ALERT_DETECT_CITIZEN: "Detektyvo ataskaita: Žaidėjas yra TAIKUS.",
        ERR_ROOM_NOT_FOUND: "Kambarys nerastas.", ERR_ALREADY_STARTED: "Žaidimas jau vyksta.",
        ERR_NOT_HOST: "Tik Hostas gali tai padaryti.", ERR_NEED_6: "Trūksta žaidėjų (min 6).",
        CONFIRM_RESET: "Ar tikrai ištrinti kambarį visiems?", MSG_ROOM_DELETED: "Kambarys buvo ištrintas.",
        title_defense: "Gynybinė Kalba", msg_defense_speech: "sako gynybinę kalbą. Ar išmesti šį žaidėją iš miestelio?",
        btn_yes: "TAIP (Išmesti)", btn_no: "NE (Atsisakyti)",
        HELP_TEXT: "<b>TIKSLAS:</b> Taikūs laimi išmetę Mafiją. Mafija laimi susilyginusi skaičiumi.<br><br><b>NAKTIS:</b> Mafija tyliai mato vieni kitų balsus ekrane. Miestiečiai turi netikrus mygtukus kamufliažui.<br><br><b>DIENA:</b> Daugumą balsų surinkęs įtariamasis sako gynybinę kalbą. Po jos atliekamas galutinis TAIP/NE balsavimas."
    },
    en: {
        GAME_TITLE: "Mafia Online",
        btn_help: "Help", title_login: "Join Game", btn_create: "Create New Room (Become Host)",
        btn_join: "Join Existing Room", title_lobby: "Lobby", lbl_room: "Room",
        lbl_players: "Connected Players:", btn_start: "Start Game (min 6)", msg_wait_host: "Waiting for host to start...",
        lbl_citizens: "Citizens:", title_game_over: "Game Over!", btn_play_again: "Play Again in this room",
        btn_leave: "Leave room to Main Menu", btn_reset: "Delete room for everyone (RESET)", help_title: "Rules and Flow",
        ph_name: "Enter your name", ph_room: "Enter room code",
        ROLE_MAFIA: "Mafia", ROLE_DETECTIVE: "Detective", ROLE_DOCTOR: "Doctor", ROLE_CITIZEN: "Citizen",
        ROLE_UNKNOWN: "Unknown", WIN_MAFIA: "MAFIA Wins!", WIN_CITIZENS: "CITIZENS Win!",
        PHASE_NIGHT: "🌙 Night", PHASE_DAY: "☀️ Day (Nomination)", PHASE_DEFENSE: "⚖️ Defense & Trial",
        MSG_DEAD: "You are dead. Spectate only.", MSG_MAFIA_ACTION: "Silently choose a target with your mafia team:",
        MSG_DOCTOR_ACTION: "Select someone to heal:", MSG_DETECTIVE_ACTION: "Select someone to investigate:",
        MSG_CITIZEN_ACTION: "Patrol (Tap screen for camouflage):", MSG_DAY_NO_DEATH: "Peaceful night, no one died.",
        MSG_DAY_DEATH: "Killed tonight:", MSG_VOTE: "Vote for the suspect:",
        BTN_SELECT: "Select", BTN_SELECTED: "Selected", BTN_VOTE: "Vote", BTN_VOTED: "Voted",
        BTN_PATROL: "Watch", BTN_PATROLLED: "Checked",
        ALERT_DETECT_MAFIA: "Detective Report: Player is MAFIA!", ALERT_DETECT_CITIZEN: "Detective Report: Player is INNOCENT.",
        ERR_ROOM_NOT_FOUND: "Room not found.", ERR_ALREADY_STARTED: "Game already started.",
        ERR_NOT_HOST: "Only Host can do this.", ERR_NEED_6: "Not enough players (min 6).",
        CONFIRM_RESET: "Delete room for everyone?", MSG_ROOM_DELETED: "Room deleted.",
        title_defense: "Defense Speech", msg_defense_speech: "is giving a defense speech. Eliminate this player?",
        btn_yes: "YES (Eliminate)", btn_no: "NO (Keep)",
        HELP_TEXT: "<b>GOAL:</b> Citizens win by eliminating Mafia. Mafia wins when numbers equal.<br><br><b>NIGHT:</b> Mafia sees live votes silently. Citizens have fake buttons for camouflage.<br><br><b>DAY:</b> Nominated player gives a defense speech, followed by a final YES/NO trial vote."
    },
    no: {
        GAME_TITLE: "Mafia Online",
        btn_help: "Hjelp", title_login: "Bli med", btn_create: "Opprett nytt rom (Bli Vert)",
        btn_join: "Bli med i eksisterende rom", title_lobby: "Lobby", lbl_room: "Rom",
        lbl_players: "Tilkoblede spillere:", btn_start: "Start spill (min 6)", msg_wait_host: "Venter på vert...",
        lbl_citizens: "Borgere:", title_game_over: "Spillet er over!", btn_play_again: "Spill igjen i dette rommet",
        btn_leave: "Forlat rommet til Hovedmenyen", btn_reset: "Slett rom for alle (RESET)", help_title: "Regler og Spillgang",
        ph_name: "Skriv inn navnet ditt", ph_room: "Skriv inn romkode",
        ROLE_MAFIA: "Mafia", ROLE_DETECTIVE: "Detektiv", ROLE_DOCTOR: "Lege", ROLE_CITIZEN: "Borger",
        ROLE_UNKNOWN: "Ukjent", WIN_MAFIA: "MAFIA Vinner!", WIN_CITIZENS: "BORGERNE Vinner!",
        PHASE_NIGHT: "🌙 Natt", PHASE_DAY: "☀️ Dag (Nominasjon)", PHASE_DEFENSE: "⚖️ Forsvar & Rettssak",
        MSG_DEAD: "Du er død. Bare se på.", MSG_MAFIA_ACTION: "Velg et offer stille med mafiaen:",
        MSG_DOCTOR_ACTION: "Velg hvem du vil beskytte:", MSG_DETECTIVE_ACTION: "Velg hvem du vil etterforske:",
        MSG_CITIZEN_ACTION: "Patruljer (Trykk på skjermen for kamuflasje):", MSG_DAY_NO_DEATH: "Fredelig natt.",
        MSG_DAY_DEATH: "Drept i natt:", MSG_VOTE: "Stem på den mistenkte:",
        BTN_SELECT: "Velg", BTN_SELECTED: "Valgt", BTN_VOTE: "Stemme", BTN_VOTED: "Har stemt",
        BTN_PATROL: "Sjekk", BTN_PATROLLED: "Sjekket",
        ALERT_DETECT_MAFIA: "Detektivrapport: Spilleren er MAFIA!", ALERT_DETECT_CITIZEN: "Detektivrapport: Spilleren er USKYLDIG.",
        ERR_ROOM_NOT_FOUND: "Rom ikke funnet.", ERR_ALREADY_STARTED: "Spillet har startet.",
        ERR_NOT_HOST: "Bare verten kan gjøre dette.", ERR_NEED_6: "Ikke nok spillere (min 6).",
        CONFIRM_RESET: "Slett rom for alle?", MSG_ROOM_DELETED: "Rom slettet.",
        title_defense: "Forsvarstale", msg_defense_speech: "holder en forsvarstale. Eliminere denne spilleren?",
        btn_yes: "JA (Eliminer)", btn_no: "NEI (Behold)",
        HELP_TEXT: "<b>MÅL:</b> Borgere vinner ved å eliminere Mafia.<br><br><b>NATT:</b> Mafiaen ser stemmer i sanntid. Borgere har falske knapper for kamuflasje.<br><br><b>DAG:</b> Mistenkt spiller holder forsvarstale før en endelig JA/NEI-avstemning."
    }
};

function t(key) { return I18N[currentLang][key] || key; }

function changeLanguage() {
    currentLang = document.getElementById('langSelect').value;
    document.title = t('GAME_TITLE');
    document.querySelectorAll('[data-i18n]').forEach(el => el.innerHTML = t(el.getAttribute('data-i18n')));
    document.querySelectorAll('[data-i18n-ph]').forEach(el => el.placeholder = t(el.getAttribute('data-i18n-ph')));
    document.getElementById('helpContent').innerHTML = t('HELP_TEXT');
    if (myRole) document.getElementById('roleDisplay').textContent = t(myRole);
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
    if (!name) return alert(t('ph_name') + '!');
    sessionStorage.setItem('mafia_player_name', name);
    socket.emit('join_game', { playerName: name, roomCode: null });
}

function joinRoom() {
    const name = document.getElementById('playerName').value.trim();
    const roomCode = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if (!name) return alert(t('ph_name') + '!');
    if (!roomCode) return alert(t('ph_room') + '!');
    sessionStorage.setItem('mafia_player_name', name);
    socket.emit('join_game', { playerName: name, roomCode: roomCode });
}

function requestGameStart() { socket.emit('start_game'); }
function playAgain() { socket.emit('play_again'); }
function resetGame() { if (confirm(t('CONFIRM_RESET'))) socket.emit('reset_game'); }

function leaveRoom() {
    sessionStorage.removeItem('mafia_player_name');
    sessionStorage.removeItem('mafia_room_code');
    socket.emit('leave_room');
    location.reload();
}

function sendDefenseVote(confirmElimination) {
    socket.emit('defense_vote', confirmElimination);
    document.getElementById('defenseSection').style.display = 'none';
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

socket.on('error_message', (msgCode) => alert(t(msgCode)));

socket.on('timer_tick', (sec) => {
    document.getElementById('timerVal').textContent = sec;
});

socket.on('mafia_votes_update', (votesSummary) => {
    mafiaVotesMap = votesSummary;
    if (currentPhase === 'NIGHT' && myRole === 'ROLE_MAFIA') {
        renderGamePlayers(lastPlayersList);
    }
});

let lastPlayersList = [];

socket.on('phase_change', (data) => {
    currentPhase = data.phase;
    sessionStorage.setItem('mafia_room_code', data.roomCode);
    lastPlayersList = data.players;

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'none';
    document.getElementById('summary-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';

    document.getElementById('displayGameRoomCode').textContent = data.roomCode;
    updateHostUI(data.players);

    if (data.role) myRole = data.role;
    if (data.isAlive !== undefined) myStatus = data.isAlive;

    document.getElementById('roleDisplay').textContent = t(myRole || 'ROLE_UNKNOWN');
    const statusMsg = document.getElementById('statusMessage');
    const title = document.getElementById('phaseTitle');
    const timerBox = document.getElementById('timerDisplay');
    const defenseBox = document.getElementById('defenseSection');

    timerBox.style.display = 'none';
    defenseBox.style.display = 'none';

    if (currentPhase === 'NIGHT') {
        title.textContent = t('PHASE_NIGHT');
        timerBox.style.display = 'block';
        if (!myStatus) statusMsg.textContent = t('MSG_DEAD');
        else if (myRole === 'ROLE_MAFIA') statusMsg.textContent = t('MSG_MAFIA_ACTION');
        else if (myRole === 'ROLE_DOCTOR') statusMsg.textContent = t('MSG_DOCTOR_ACTION');
        else if (myRole === 'ROLE_DETECTIVE') statusMsg.textContent = t('MSG_DETECTIVE_ACTION');
        else statusMsg.textContent = t('MSG_CITIZEN_ACTION');
    } else if (currentPhase === 'DAY_VOTING') {
        title.textContent = t('PHASE_DAY');
        let txt = data.killedPlayer ? `${t('MSG_DAY_DEATH')} ${data.killedPlayer}.` : t('MSG_DAY_NO_DEATH');
        statusMsg.textContent = txt + ' ' + t('MSG_VOTE');
    } else if (currentPhase === 'DAY_DEFENSE') {
        title.textContent = t('PHASE_DEFENSE');
        document.getElementById('accusedNameDisplay').textContent = data.accusedName;
        if (myStatus && data.accusedId !== socket.id) {
            defenseBox.style.display = 'block';
        }
    }

    renderGamePlayers(data.players);
});

socket.on('detective_result', (res) => alert(res.isMafia ? t('ALERT_DETECT_MAFIA') : t('ALERT_DETECT_CITIZEN')));

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
    if (msgCode) alert(t(msgCode));
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

        // Mafijos indikatorius apie balsus (matomas TIK Mafijai)
        if (currentPhase === 'NIGHT' && myRole === 'ROLE_MAFIA' && mafiaVotesMap[p.id]) {
            const voteBadge = document.createElement('span');
            voteBadge.className = 'vote-badge';
            voteBadge.textContent = `${mafiaVotesMap[p.id]} 🗳️`;
            li.appendChild(voteBadge);
        }

        if (myStatus && p.isAlive) {
            if (currentPhase === 'NIGHT') {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                
                if (['ROLE_MAFIA', 'ROLE_DOCTOR', 'ROLE_DETECTIVE'].includes(myRole)) {
                    btn.textContent = t('BTN_SELECT');
                    btn.onclick = () => {
                        socket.emit('night_action', p.id);
                        btn.disabled = true;
                        btn.textContent = t('BTN_SELECTED');
                    };
                } else {
                    // DEKORATYVINIS MYGTUKAS MIESTIEČIAMS (Kamufliažas)
                    btn.textContent = t('BTN_PATROL');
                    btn.onclick = () => {
                        socket.emit('night_action', 'dummy');
                        btn.disabled = true;
                        btn.textContent = t('BTN_PATROLLED');
                    };
                }
                li.appendChild(btn);
            } else if (currentPhase === 'DAY_VOTING') {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.textContent = t('BTN_VOTE');
                btn.onclick = () => {
                    socket.emit('cast_vote', p.id);
                    btn.disabled = true;
                    btn.textContent = t('BTN_VOTED');
                };
                li.appendChild(btn);
            }
        }
        list.appendChild(li);
    });
}
