const socket = io(window.location.origin);

let playerId;

const nameEl = document.getElementById('name');
document.getElementById('joinBtn').addEventListener('click', () => {
    socket.emit('join', nameEl.value, player => {
        playerId = player.id;
    });
    nameEl.parentNode.classList.add('hide');
});

this.interval;
this.timer;

let dealer = document.getElementById('dealer');
let dealerCards = dealer.querySelector('.dealer-cards');
let dealerTotal = dealer.querySelector('.card-sum');
let seats = document.getElementById('seats');
let timerH1 = document.getElementById('timer');

let interface = document.getElementById('interfce');

socket.on('bet', async (q, callback) => {
    clearInterval(this.interval);
    clearTimeout(this.timer);
    let i = 10;
    this.interval = setInterval(() => timerH1.innerText = --i, 1000);
    this.timer = setTimeout(() => clearInterval(interval), 10000);

    interface.innerHTML = '';

    [2, 4, 10, 25, 30, 'enough'].forEach(bet => {
        const btnBet = document.createElement('button');
        btnBet.innerText = bet > 0 ? `Bet X${bet}` : 'Enough';
        btnBet.addEventListener('click', () => {
            callback(bet);
            interface.innerHTML = '';

            clearInterval(this.interval);
            clearTimeout(this.timer);
            timerH1.innerText = '0';
        });

        interface.appendChild(btnBet);
    });


});

socket.on('play', async (q, callback) => {
    clearInterval(this.interval);
    clearTimeout(this.timer);
    let i = 10;
    this.interval = setInterval(() => timerH1.innerText = --i, 1000);
    this.timer = setTimeout(() => clearInterval(interval), 10000);

    interface.innerHTML = '';
    const btnMore = document.createElement('button');
    btnMore.innerText = 'Hit';
    btnMore.addEventListener('click', () => {
        callback('hit');
        btnMore.remove();
        btnEnough.remove();

        clearInterval(this.interval);
        clearTimeout(this.timer);
        timerH1.innerText = '0';
    });

    const btnEnough = document.createElement('button');
    btnEnough.innerText = 'Stand';
    btnEnough.addEventListener('click', () => {
        callback('stand');
        btnMore.remove();
        btnEnough.remove();

        clearInterval(this.interval);
        clearTimeout(this.timer);
        timerH1.innerText = '0';
    });

    interface.appendChild(btnMore);
    interface.appendChild(btnEnough);

});

function fillCards(card, parent) {
    let cardEl = document.createElement('card');

    [0, 1].forEach(i => {
        let cardD = document.createElement('div');
        let cardValue = document.createElement('div');

        cardValue.innerHTML = `${Number(card.pip) < 11 ? card.pip : card.pip.substr(0,1).toUpperCase()}&${card.suit};`;

        cardD.appendChild(cardValue);
        cardEl.appendChild(cardD);
    });

    cardEl.classList.add(card.suit);
    cardEl.classList.add(card.pip.substr(0, 1).toUpperCase());
    parent.appendChild(cardEl);
}

function fillSeats(seat) {
    let seatEl = document.createElement('div');
    seatEl.className = 'seat';
    seatEl.id = `seat${seat.id}`;

    const seatPlayerEl = document.createElement('div');
    seatPlayerEl.className = 'player';
    seatEl.appendChild(seatPlayerEl);

    if (seat.player) {

        const nameEl = document.createElement('div');
        nameEl.className = 'name';
        seatPlayerEl.appendChild(nameEl);

        const statusEl = document.createElement('div');
        statusEl.className = 'status';
        seatPlayerEl.appendChild(statusEl);

        const tokensEl = document.createElement('div');
        tokensEl.className = 'tokens';
        seatPlayerEl.appendChild(tokensEl);

        const totalEl = document.createElement('div');
        totalEl.className = 'card-sum';
        seatEl.appendChild(totalEl);
    }

    const cardsEl = document.createElement('div');
    cardsEl.className = 'card-place';
    seatEl.appendChild(cardsEl);

    const betEl = document.createElement('div');
    betEl.className = 'bet-place';
    seatEl.appendChild(betEl);

    seats.appendChild(seatEl);

    if (seat.player) {

        if (seat.player) seatEl.querySelector('.name').innerText = seat.player.id === playerId ? 'YOU' : seat.player.name;

        if (seat.player) seatEl.querySelector('.card-sum').innerText = seat.player.total;

        if (seat.player) {
            switch (seat.status) {
                case 0:
                    seatEl.querySelector('.status').innerText = '';
                    break;
                case 1:
                    seatEl.querySelector('.status').innerText = 'Loose';
                    break;
                case 2:
                    seatEl.querySelector('.status').innerText = 'Win';
                    break;
                case 3:
                    seatEl.querySelector('.status').innerText = 'BlackJack';
                    break;
                case 4:
                    seatEl.querySelector('.status').innerText = 'Draw';
                    break;
            }
        }

        let bet = seatEl.querySelector('.bet-place');
        bet.innerHTML = '';

        Object.values(seat.bet.reduce((arr, cur) => {
            if (!arr[cur.value]) arr[cur.value] = [];
            arr[cur.value].push(cur);
            return arr;
        }, {})).forEach(chips => {

            let chipGroupEl = document.createElement('div');

            chips.forEach(chip => {

                let chipEl = document.createElement(`chip_${chip.value}`);

                chipEl.classList.add('chip');

                chipGroupEl.appendChild(chipEl);

            });

            seatEl.querySelector('.bet-place').appendChild(chipGroupEl);

        });

        Object.values(seat.deposit.reduce((arr, cur) => {
            if (!arr[cur.value]) arr[cur.value] = [];
            arr[cur.value].push(cur);
            return arr;
        }, {})).forEach(chips => {

            let chipGroupEl = document.createElement('div');

            chips.forEach(chip => {

                let chipEl = document.createElement(`chip_${chip.value}`);

                chipEl.classList.add('chip');

                chipGroupEl.appendChild(chipEl);

            });

            seatEl.querySelector('.tokens').appendChild(chipGroupEl);

        });

        let cards = seatEl.querySelector('.card-place');
        cards.innerHTML = '';
        if (seat.player) seat.player.hand.forEach(card => fillCards(card, cards));
    }

}

socket.on('updates', updates => {
    dealerCards.innerHTML = '';
    dealerTotal.innerHTML = updates.dealer.total;
    updates.dealer.hand.forEach(card => fillCards(card, dealerCards));
    seats.innerHTML = '';
    updates.seats.forEach(seat => fillSeats(seat));

    if (updates.active) document.getElementById(`seat${updates.active}`).querySelector('.player').classList.add('active');

    updates.freeSeats.forEach(seat => fillSeats(seat));

});

socket.on('errors', err => {
    console.log({
        err
    });
});

/* socket.on('player', id => {
    playerId = id;
}); */