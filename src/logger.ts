const date = (d: Date)=> {

    const date = d.toISOString().split('T')[0];

    const time = d.toTimeString().split(' ')[0];

    return `\u001b[1m${date} ${time}\u001b[0m`;

};

export default {

    log: (message: string) => console.log(`${date(new Date())} ${message}`),

    info: (message: string) => console.info(`${date(new Date())} \u001b[36m${message}\u001b[0m`),

    warn: (message: string) => console.warn(`${date(new Date())} \u001b[33m${message}\u001b[0m`),

    error: (message: string) => console.error(`${date(new Date())} \u001b[31m${message}\u001b[0m`)

}