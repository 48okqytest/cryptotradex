// Crypto data
const cryptoData = {
    BTC: {
        name: "Bitcoin",
        symbol: "BTC",
        price: 42563.78,
        change24h: 2.34,
        icon: "🟠",
        color: "#f7931a",
        history: generateHistory(42563.78)
    },
    ETH: {
        name: "Ethereum",
        symbol: "ETH",
        price: 2543.21,
        change24h: -1.23,
        icon: "🔷",
        color: "#627eea",
        history: generateHistory(2543.21)
    },
    DOGE: {
        name: "Dogecoin",
        symbol: "DOGE",
        price: 0.0876,
        change24h: 5.67,
        icon: "🐕",
        color: "#cb9800",
        history: generateHistory(0.0876)
    },
    FAKE: {
        name: "FakeCoin",
        symbol: "FAKE",
        price: 3.45,
        change24h: 12.56,
        icon: "🃏",
        color: "#9b59b6",
        history: generateHistory(3.45)
    },
    MOON: {
        name: "MoonToken",
        symbol: "MOON",
        price: 0.56,
        change24h: -3.45,
        icon: "🌕",
        color: "#3498db",
        history: generateHistory(0.56)
    },
    HODL: {
        name: "HODL Token",
        symbol: "HODL",
        price: 12.34,
        change24h: 0.89,
        icon: "💎",
        color: "#1abc9c",
        history: generateHistory(12.34)
    }
};

// User data
let user = {
    balance: 10000,
    portfolio: {
        BTC: { amount: 0.1, buyPrice: 42000 },
        ETH: { amount: 2, buyPrice: 2500 },
        FAKE: { amount: 100, buyPrice: 3.00 }
    },
    transactions: [
        { date: "2023-06-01", type: "buy", symbol: "BTC", amount: 0.1, price: 42000, total: 4200 },
        { date: "2023-06-05", type: "buy", symbol: "ETH", amount: 2, price: 2500, total: 5000 },
        { date: "2023-06-10", type: "buy", symbol: "FAKE", amount: 100, price: 3.00, total: 300 }
    ]
};

// Leaderboard data
const leaderboard = [
    { name: "CryptoKing", value: 15432, change: 8.76, badges: 5 },
    { name: "BitcoinBaron", value: 14256, change: 5.43, badges: 4 },
    { name: "EthereumElite", value: 13890, change: 12.34, badges: 3 },
    { name: "DogeDynasty", value: 12567, change: -2.34, badges: 2 },
    { name: "FakeCoinFan", value: 11876, change: 23.45, badges: 1 },
    { name: "You", value: 10234, change: 2.34, badges: 1 }
];

// DOM Elements
const cryptoGrid = document.querySelector('.crypto-grid');
const cryptoSelect = document.getElementById('crypto-select');
const tradeAction = document.getElementById('trade-action');
const tradeAmount = document.getElementById('trade-amount');
const currentPrice = document.getElementById('current-price');
const estimatedCost = document.getElementById('estimated-cost');
const executeTrade = document.getElementById('execute-trade');
const priceChart = document.getElementById('price-chart');
const timeFilters = document.querySelectorAll('.time-filter');
const userBalance = document.getElementById('user-balance');
const portfolioValue = document.getElementById('portfolio-value');
const portfolioChange = document.getElementById('portfolio-change');
const topPerformer = document.getElementById('top-performer');
const holdingsBody = document.getElementById('holdings-body');
const transactionBody = document.getElementById('transaction-body');
const leaderboardBody = document.getElementById('leaderboard-body');
const notificationContainer = document.getElementById('notification-container');
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('main section');

// Chart instance
let chart;

// Initialize the app
function init() {
    renderCryptoCards();
    setupNavigation();
    setupTradeForm();
    renderPortfolio();
    renderTransactions();
    renderLeaderboard();
    updateUserBalance();
    
    // Set up initial chart
    updateChart('BTC', '24h');
    
    // Simulate price changes
    setInterval(simulatePriceChanges, 5000);
}

// Render crypto cards for dashboard
function renderCryptoCards() {
    cryptoGrid.innerHTML = '';
    
    for (const symbol in cryptoData) {
        const crypto = cryptoData[symbol];
        const changeClass = crypto.change24h >= 0 ? 'positive' : 'negative';
        
        const card = document.createElement('div');
        card.className = 'crypto-card';
        card.dataset.symbol = symbol;
        card.innerHTML = `
            <div class="crypto-header">
                <div class="crypto-icon" style="background-color: ${crypto.color}">${crypto.icon}</div>
                <div>
                    <div class="crypto-name">${crypto.name}</div>
                    <div class="crypto-symbol">${symbol}</div>
                </div>
            </div>
            <div class="crypto-price">$${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div class="crypto-change ${changeClass}">${crypto.change24h >= 0 ? '+' : ''}${crypto.change24h.toFixed(2)}%</div>
        `;
        
        card.addEventListener('click', () => {
            // Switch to trade tab and select this crypto
            document.querySelector('nav a[href="#trade"]').click();
            cryptoSelect.value = symbol;
            updateTradeForm();
            updateChart(symbol, '24h');
        });
        
        cryptoGrid.appendChild(card);
    }
}

// Set up navigation
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show corresponding section
            const target = link.getAttribute('href').substring(1);
            sections.forEach(section => {
                section.classList.add('hidden');
                if (section.id === target) {
                    section.classList.remove('hidden');
                }
            });
        });
    });
}

// Set up trade form
function setupTradeForm() {
    // Populate crypto select
    cryptoSelect.innerHTML = '';
    for (const symbol in cryptoData) {
        const option = document.createElement('option');
        option.value = symbol;
        option.textContent = `${cryptoData[symbol].name} (${symbol})`;
        cryptoSelect.appendChild(option);
    }
    
    // Set up event listeners
    cryptoSelect.addEventListener('change', updateTradeForm);
    tradeAction.addEventListener('change', updateTradeForm);
    tradeAmount.addEventListener('input', updateTradeForm);
    
    executeTrade.addEventListener('click', executeTradeAction);
    
    // Initialize form
    updateTradeForm();
}

// Update trade form based on selections
function updateTradeForm() {
    const symbol = cryptoSelect.value;
    const action = tradeAction.value;
    const amount = parseFloat(tradeAmount.value) || 0;
    const crypto = cryptoData[symbol];
    
    currentPrice.textContent = `$${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const cost = amount * crypto.price;
    estimatedCost.textContent = `$${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Disable button if invalid amount
    if (amount <= 0 || (action === 'sell' && (!user.portfolio[symbol] || user.portfolio[symbol].amount < amount))) {
        executeTrade.disabled = true;
    } else {
        executeTrade.disabled = false;
    }
}

// Execute trade
function executeTradeAction() {
    const symbol = cryptoSelect.value;
    const action = tradeAction.value;
    const amount = parseFloat(tradeAmount.value);
    const crypto = cryptoData[symbol];
    const cost = amount * crypto.price;
    
    if (action === 'buy') {
        if (cost > user.balance) {
            showNotification('Insufficient funds', 'error');
            return;
        }
        
        user.balance -= cost;
        
        if (user.portfolio[symbol]) {
            // Average the buy price
            const totalAmount = user.portfolio[symbol].amount + amount;
            const totalCost = user.portfolio[symbol].amount * user.portfolio[symbol].buyPrice + cost;
            user.portfolio[symbol].buyPrice = totalCost / totalAmount;
            user.portfolio[symbol].amount = totalAmount;
        } else {
            user.portfolio[symbol] = {
                amount: amount,
                buyPrice: crypto.price
            };
        }
        
        showNotification(`Successfully bought ${amount} ${symbol} for $${cost.toFixed(2)}`, 'success');
    } else { // sell
        if (!user.portfolio[symbol] || user.portfolio[symbol].amount < amount) {
            showNotification(`You don't have enough ${symbol} to sell`, 'error');
            return;
        }
        
        user.balance += cost;
        user.portfolio[symbol].amount -= amount;
        
        if (user.portfolio[symbol].amount <= 0.0001) { // Account for floating point
            delete user.portfolio[symbol];
        }
        
        showNotification(`Successfully sold ${amount} ${symbol} for $${cost.toFixed(2)}`, 'success');
    }
    
    // Record transaction
    user.transactions.unshift({
        date: new Date().toISOString().split('T')[0],
        type: action,
        symbol: symbol,
        amount: amount,
        price: crypto.price,
        total: cost
    });
    
    // Update UI
    updateTradeForm();
    updateUserBalance();
    renderPortfolio();
    renderTransactions();
}

// Update user balance display
function updateUserBalance() {
    userBalance.textContent = `$${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Render portfolio
function renderPortfolio() {
    // Calculate portfolio value and change
    let totalValue = user.balance;
    let prevValue = user.balance;
    let changes = {};
    
    for (const symbol in user.portfolio) {
        const holding = user.portfolio[symbol];
        const currentValue = holding.amount * cryptoData[symbol].price;
        const prevPrice = cryptoData[symbol].price / (1 + cryptoData[symbol].change24h / 100);
        const prevHoldingValue = holding.amount * prevPrice;
        
        totalValue += currentValue;
        prevValue += prevHoldingValue;
        changes[symbol] = ((currentValue - prevHoldingValue) / prevHoldingValue) * 100;
    }
    
    const portfolioChangeValue = ((totalValue - prevValue) / prevValue) * 100;
    
    // Update summary
    portfolioValue.textContent = `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    portfolioChange.textContent = `${portfolioChangeValue >= 0 ? '+' : ''}${portfolioChangeValue.toFixed(2)}%`;
    portfolioChange.className = portfolioChangeValue >= 0 ? 'positive' : 'negative';
    
    // Find top performer
    let topSymbol = '';
    let topChange = -Infinity;
    
    for (const symbol in changes) {
        if (changes[symbol] > topChange) {
            topChange = changes[symbol];
            topSymbol = symbol;
        }
    }
    
    if (topSymbol) {
        topPerformer.textContent = `${topSymbol} ${topChange >= 0 ? '+' : ''}${topChange.toFixed(1)}%`;
        topPerformer.className = topChange >= 0 ? 'positive' : 'negative';
    } else {
        topPerformer.textContent = 'N/A';
        topPerformer.className = '';
    }
    
    // Render holdings table
    holdingsBody.innerHTML = '';
    
    for (const symbol in user.portfolio) {
        const holding = user.portfolio[symbol];
        const crypto = cryptoData[symbol];
        const value = holding.amount * crypto.price;
        const change24h = crypto.change24h;
        const changeClass = change24h >= 0 ? 'positive' : 'negative';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="crypto-icon" style="background-color: ${crypto.color}">${crypto.icon}</div>
                    <div>
                        <div>${crypto.name}</div>
                        <div style="font-size: 0.8rem; color: #777;">${symbol}</div>
                    </div>
                </div>
            </td>
            <td>${holding.amount.toFixed(4)}</td>
            <td>$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="${changeClass}">${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%</td>
            <td>
                <button class="action-btn buy-btn" data-symbol="${symbol}">Buy</button>
                <button class="action-btn sell-btn" data-symbol="${symbol}">Sell</button>
            </td>
        `;
        
        holdingsBody.appendChild(row);
    }
    
    // Add event listeners to action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const symbol = btn.dataset.symbol;
            
            // Switch to trade tab and pre-fill form
            document.querySelector('nav a[href="#trade"]').click();
            cryptoSelect.value = symbol;
            
            if (btn.classList.contains('buy-btn')) {
                tradeAction.value = 'buy';
            } else {
                tradeAction.value = 'sell';
            }
            
            updateTradeForm();
            updateChart(symbol, '24h');
        });
    });
}

// Render transaction history
function renderTransactions() {
    transactionBody.innerHTML = '';
    
    user.transactions.forEach(tx => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tx.date}</td>
            <td class="${tx.type === 'buy' ? 'positive' : 'negative'}">${tx.type.toUpperCase()}</td>
            <td>${tx.symbol}</td>
            <td>${tx.amount.toFixed(4)}</td>
            <td>$${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>$${tx.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        `;
        transactionBody.appendChild(row);
    });
}

// Render leaderboard
function renderLeaderboard() {
    leaderboardBody.innerHTML = '';
    
    leaderboard.forEach((trader, index) => {
        const row = document.createElement('tr');
        const isUser = trader.name === 'You';
        
        if (isUser) {
            row.classList.add('user-row');
        }
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${trader.name}</strong></td>
            <td>$${trader.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="${trader.change >= 0 ? 'positive' : 'negative'}">${trader.change >= 0 ? '+' : ''}${trader.change.toFixed(2)}%</td>
            <td>
                <div style="display: flex; gap: 5px;">
                    ${Array(trader.badges).fill('<i class="fas fa-medal" style="color: gold;"></i>').join('')}
                </div>
            </td>
        `;
        
        leaderboardBody.appendChild(row);
    });
}

// Update price chart
function updateChart(symbol, timeframe) {
    const crypto = cryptoData[symbol];
    let labels, data;
    
    // Generate appropriate labels and data based on timeframe
    if (timeframe === '24h') {
        labels = Array(24).fill(0).map((_, i) => `${i}:00`);
        data = crypto.history.slice(-24);
    } else if (timeframe === '7d') {
        labels = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];
        data = crypto.history.slice(-7);
    } else if (timeframe === '1m') {
        labels = Array(30).fill(0).map((_, i) => `${i + 1}d`);
        data = crypto.history.slice(-30);
    } else { // 1y
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // For simplicity, we'll just take 12 points from the history
        data = [];
        const step = Math.floor(crypto.history.length / 12);
        for (let i = 0; i < 12; i++) {
            data.push(crypto.history[i * step]);
        }
    }
    
    // Update active time filter
    timeFilters.forEach(filter => {
        filter.classList.remove('active');
        if (filter.textContent.toLowerCase() === timeframe) {
            filter.classList.add('active');
        }
    });
    
    // Create or update chart
    const ctx = priceChart.getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${symbol} Price`,
                data: data,
                borderColor: crypto.color,
                backgroundColor: `${crypto.color}20`,
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'times-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.5s reverse forwards';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Generate random price history
function generateHistory(basePrice) {
    const history = [basePrice];
    for (let i = 1; i < 365; i++) {
        // Random walk with some volatility
        const change = (Math.random() - 0.5) * 0.05;
        history.push(history[i - 1] * (1 + change));
    }
    return history;
}

// Simulate price changes
function simulatePriceChanges() {
    for (const symbol in cryptoData) {
        const crypto = cryptoData[symbol];
        const change = (Math.random() - 0.45) * 0.5; // Slightly bullish bias
        const newPrice = crypto.price * (1 + change / 100);
        
        // Update price and change
        crypto.change24h = (newPrice - crypto.price) / crypto.price * 100;
        crypto.price = newPrice;
        
        // Add to history
        crypto.history.push(newPrice);
        if (crypto.history.length > 365) {
            crypto.history.shift();
        }
    }
    
    // Update UI if needed
    if (document.querySelector('nav a.active').getAttribute('href') === '#dashboard') {
        renderCryptoCards();
    }
    
    renderPortfolio();
    updateTradeForm();
}

// Set up time filters
timeFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        const timeframe = filter.textContent.toLowerCase();
        updateChart(cryptoSelect.value, timeframe);
    });
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
