// Jungiamasi tiesiai į Render serverį
const socket = io('https://mafia-muw1.onrender.com');

function joinGame() {
    const name = document.getElementById('playerName').value.trim();
    if (name === '') {
        alert('Įveskite vardą.');
        return;
    }
    
    // Siunčiama prisijungimo užklausa į serverį
    socket.emit('join_game', name);
    
    // Paslepiamas prisijungimo langas ir parodomas laukiamasis
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'block';
}

// Serveris atsiunčia atnaujintą žaidėjų sąrašą
socket.on('update_players', (players) => {
    const list = document.getElementById('playersList');
    list.innerHTML = '';
    
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name;
        list.appendChild(li);
    });
});

// Klaidų apdorojimas (pvz., jei bandoma jungtis, kai žaidimas jau vyksta)
socket.on('error_message', (msg) => {
    alert(msg);
});
