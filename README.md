# black-jack-app
Simple multiplayer blackjack card game

## Install
```sh
npm install
```

## Start
```sh
npm start
```

## Web Socket Actions

### Connect
Client `connect` to server

![connect](readme/connect.svg)

```javascript
const socket = io('http://127.0.0.1:4000'); // Set server host
```

### Down
Client sending `down` to server with player name and receive the player id

![down](readme/down.svg)

```javascript
socket.emit('down', 'Player Name', player => {
    const playerId = player.id;
});
```

### Bet
Server ask players to do betting

![betting](readme/betting.svg)

Client must subscribe to `bet`

```javascript
socket.on('bet', async (question, callback) => {
    callback(bet); // bet must be 'enough' or number of multiply
});
```

### Deal
Server ask players to deal

![deal](readme/deal.svg)

Client must subscribe to `deal`

```javascript
socket.on('deal', async (question, callback) => {
    callback(ansver); // ansver must be 'enough' or 'hit`
});
```

### Leave
Client can leave game anytime 

![leave](readme/leave.svg)

```javascript
socket.emit('leave');
```