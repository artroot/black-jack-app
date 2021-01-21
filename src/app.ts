import { IncomingMessage, ServerResponse } from "http";

import * as fs from 'fs';

import config from './config.game';

import Game from "./game";

import { Player } from './entities/player';

import { Token, TokenValue } from './entities/token';

class App {

    private game: Game;

    constructor() {
        this.game = new Game(config.maxSeats, config.minBet, config.amountDeck);
    }

    public handleHTTP(req: IncomingMessage, res: ServerResponse) {

        try {

            if (req.url === '/') {
                res.setHeader("Content-Type", "text/html; charset=utf-8;");
                res.write(fs.readFileSync('client/index.html', 'utf8'));
            }
            else if (/^\/assets\//.test(req.url)) {
                res.write(fs.readFileSync(`client${req.url}`, 'utf8'));
            }

        } catch(err) {
            res.statusCode = 500;
            res.write(err.message);
        }

        res.end();

    }

    public handleWS(socket: any) {
        
        const player = new Player(socket);

        console.info(`Player ${player.id} connected`);

        player.setToken(new Token(TokenValue.$100));

        this.game.broadcast();

        socket.on('join', (name, callback) => {
            player.name = name;
            this.game.join(player);
            console.info(`Player ${player.id} join game as <${player.name}>`);
            callback({id: player.id});
        });

        socket.on('leave', () => this.game.leave(player));

        try{
            this.game.joinWatcher(player);
        }catch(err) {
            socket.emit('errors', err.message);
        }

        socket.on('disconnect', () => {
            console.info(`Player ${player.id} disconnected`);
            this.game.leave(player);
            console.info(`Player ${player.id} leave game`);
        });

    }

}

export default new App();