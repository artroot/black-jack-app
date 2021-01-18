import { IncomingMessage, ServerResponse } from "http";

class App {

    public handle(req: IncomingMessage, res: ServerResponse) {

        res.setHeader("Content-Type", "text/html; charset=utf-8;");

        res.write('Server alive');

        res.end();

    }

}

export default new App();