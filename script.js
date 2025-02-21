let transactions = [];
let playerTransactions = [];
let currentRole = localStorage.getItem('currentRole') || null;
let currentBalance = 0;
let bankerBalance = 0;
let players = [];

document.addEventListener("DOMContentLoaded", function () {
    let themeToggle = document.getElementById("theme-toggle");
    let lunarTheme = document.getElementById("lunar-theme");
    let normalTheme = document.getElementById("normal-theme");

    // Check localStorage for the saved theme and set it accordingly
    let savedTheme = localStorage.getItem("theme");
    if (savedTheme === "lunar") {
        themeToggle.checked = true;
        lunarTheme.disabled = false;
        normalTheme.disabled = true;
    } else {
        themeToggle.checked = false;
        lunarTheme.disabled = true;
        normalTheme.disabled = false;
    }

    // Toggle theme when the switch is clicked
    themeToggle.addEventListener("change", function () {
        if (this.checked) {
            lunarTheme.disabled = false;
            normalTheme.disabled = true;
            localStorage.setItem("theme", "lunar");
        } else {
            lunarTheme.disabled = true;
            normalTheme.disabled = false;
            localStorage.setItem("theme", "normal");
        }
    });
});

function addPlayer() {
    const name = document.getElementById('new-player-name').value.trim();
    const bet = Number(document.getElementById('new-player-bet').value);
    
    if (!name || !bet) {
        alert('Please enter both name and bet amount');
        return;
    }

    const player = {
        id: Date.now(), // unique ID for each player
        name: name,
        bet: bet
    };

    players.push(player);
    renderPlayers();
    
    // Clear inputs
    document.getElementById('new-player-name').value = '';
    document.getElementById('new-player-bet').value = '';
}

function renderPlayers() {
    const playersContainer = document.getElementById('players-list');
    playersContainer.innerHTML = '';

    players.forEach(player => {
        const playerElement = createPlayerElement(player);
        playersContainer.appendChild(playerElement);
    });
}

function createPlayerElement(player) {
    const div = document.createElement('div');
    div.className = 'player-card';
    div.innerHTML = `
        <div class="player-info">
            <span>${player.name} - Bet: $${player.bet}</span>
            <button class="remove-player" onclick="removePlayer(${player.id})">×</button>
        </div>
        <div class="player-controls">
            <button onclick="updateBankerBalance(${player.id}, 1)">Win</button>
            <button onclick="updateBankerBalance(${player.id}, -1)">Lose</button>
            <button onclick="toggleCustomMultiplier(${player.id})">Custom</button>
            <button onclick="toggleBetUpdate(${player.id})">Update Bet</button>
        </div>
        <div id="custom-multiplier-${player.id}" class="custom-multiplier-container" style="display: none;">
            <input type="range" min="-5" max="5" value="1" step="0.1" 
                onInput="updateMultiplierDisplay(${player.id})">
            <span id="multiplier-value-${player.id}">1x</span>
            <button onclick="applyBankerCustomMultiplier(${player.id})">Apply</button>
        </div>
        <div id="bet-update-${player.id}" class="bet-update-container" style="display: none;">
            <input type="number" id="new-bet-${player.id}" value="${player.bet}">
            <button onclick="updatePlayerBet(${player.id})">Update</button>
        </div>
    `;
    return div;
}

function removePlayer(playerId) {
    players = players.filter(p => p.id !== playerId);
    renderPlayers();
}

function updateBankerBalance(playerId, multiplier) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        const change = player.bet * multiplier;
        bankerBalance += change;
        document.getElementById('banker-balance').textContent = bankerBalance;
        
        transactions.push({
            playerId: playerId,
            playerName: player.name,
            amount: change,
            timestamp: new Date()
        });
    }
}

function toggleCustomMultiplier(playerId) {
    const customMultiplier = document.getElementById(`custom-multiplier-${playerId}`);
    customMultiplier.style.display = customMultiplier.style.display === 'none' ? 'block' : 'none';
}

function toggleBetUpdate(playerId) {
    const betUpdate = document.getElementById(`bet-update-${playerId}`);
    betUpdate.style.display = betUpdate.style.display === 'none' ? 'block' : 'none';
}

function updateMultiplierDisplay(playerId) {
    const slider = document.querySelector(`#custom-multiplier-${playerId} input[type="range"]`);
    const display = document.getElementById(`multiplier-value-${playerId}`);
    display.textContent = `${slider.value}x`;
}

function applyBankerCustomMultiplier(playerId) {
    const slider = document.querySelector(`#custom-multiplier-${playerId} input[type="range"]`);
    updateBankerBalance(playerId, Number(slider.value));
    toggleCustomMultiplier(playerId);
}

function updatePlayerBet(playerId) {
    const newBet = Number(document.getElementById(`new-bet-${playerId}`).value);
    const player = players.find(p => p.id === playerId);
    if (player && newBet > 0) {
        player.bet = newBet;
        renderPlayers();
    }
}

function selectRole(role) {
    currentRole = role;
    localStorage.setItem('currentRole', role);
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(`${role}-screen`).classList.add('active');
}

window.addEventListener('load', () => {
    if (currentRole) {
        selectRole(currentRole);
    }
});


function updateBalance(multiplier) {
    const betAmount = Number(document.getElementById('bet-amount').value);
    const change = betAmount * multiplier;
    currentBalance += change;
    document.getElementById('balance').textContent = currentBalance;
    
    playerTransactions.push({
        amount: change,
        multiplier: multiplier,
        timestamp: new Date()
    });
}

function showCustomMultiplier() {
    const customMultiplier = document.getElementById('custom-multiplier');
    customMultiplier.classList.toggle('hidden');
}

function applyCustomMultiplier() {
    const multiplier = Number(document.getElementById('multiplier-slider').value);
    updateBalance(multiplier);
}

function startNewSession() { 
    // Reset all values 
    currentBalance = 0; bankerBalance = 0; players = []; transactions = []; playerTransactions = []; // Update displays 
    document.getElementById('balance').textContent = '0';
    document.getElementById('banker-balance').textContent = '0'; 
    document.getElementById('players-list').innerHTML = ''; // Return to role selection 
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active')); 
    document.getElementById('role-selection').classList.add('active'); // Clear stored role 
    localStorage.removeItem('currentRole'); 
    currentRole = null; 
}

function endPlayerSession() {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('summary-screen').classList.add('active');
    
    const summaryResult = document.getElementById('summary-result');
    const summaryDetails = document.getElementById('summary-details');

    // Create result message
    if (currentBalance === 0) {
        summaryResult.className = 'summary-box draw';
        summaryResult.innerHTML = 'You broke even 💸';
    } else if (currentBalance > 0) {
        summaryResult.className = 'summary-box win';
        summaryResult.innerHTML = `Congrats! You won $${currentBalance} 🎉`;
    } else if (currentBalance < 0) {
        summaryResult.className = 'summary-box lose';
        summaryResult.innerHTML = `Dang! You lost $${Math.abs(currentBalance)} 😢`;
    }
    
    // Create transaction history
    let historyHTML = '<h3>Transaction History:</h3><ul class="transaction-list">';
    playerTransactions.forEach(t => {
        historyHTML += `<li>${t.amount > 0 ? 'Won' : 'Lost'} $${Math.abs(t.amount)} (${t.multiplier}x)`;
    });
    historyHTML += '';
    summaryDetails.innerHTML = historyHTML;
}

function endBankerSession() {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('summary-screen').classList.add('active');
    
    const summaryResult = document.getElementById('summary-result');
    const summaryDetails = document.getElementById('summary-details');
    
    // Create result message
    if (bankerBalance === 0) {
        summaryResult.className = 'summary-box draw';
        summaryResult.innerHTML = 'You broke even overall 💸';
    } else if (bankerBalance > 0) {
        summaryResult.className = 'summary-box win';
        summaryResult.innerHTML = `Congrats! You won $${bankerBalance} overall 🎉`;
    } else if (bankerBalance < 0) {
        summaryResult.className = 'summary-box lose';
        summaryResult.innerHTML = `Dang! You lost $${Math.abs(bankerBalance)} overall 😢`;
    }
    
    // Create player summary
    let summaryByPlayer = {};
    transactions.forEach(t => {
        if (!summaryByPlayer[t.playerName]) {
            summaryByPlayer[t.playerName] = 0;
        }
        summaryByPlayer[t.playerName] += t.amount;
    });
    
    let historyHTML = 'Summary by Player: <ul><br>'; 
    Object.entries(summaryByPlayer).forEach(([player, amount]) => { 
        historyHTML += `${player}: ${amount > 0 ? 'Won' : 'Lost'} $${Math.abs(amount)}</li><br>`; 
    }); 
    historyHTML += '</ul>'; 
    summaryDetails.innerHTML = historyHTML; 
}  

// Sync bet amount input and slider
document.getElementById('bet-slider').addEventListener('input', (e) => {
    document.getElementById('bet-amount').value = e.target.value;
});

document.getElementById('bet-amount').addEventListener('input', (e) => {
    document.getElementById('bet-slider').value = e.target.value;
});

// Update multiplier value display
document.getElementById('multiplier-slider').addEventListener('input', (e) => {
    document.getElementById('multiplier-value').textContent = `${e.target.value}x`;
});