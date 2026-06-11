'use strict';

const readline = require('readline');
const { ElizaBot } = require('./eliza');

const bot = new ElizaBot();
const interactive = Boolean(process.stdin.isTTY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: interactive ? 'YOU> ' : ''
});

function say(message) {
  process.stdout.write(`ELIZA> ${message}\n`);
}

say(bot.getInitial());

if (interactive) {
  rl.prompt();
}

rl.on('line', (line) => {
  const input = line.trim();

  if (!input) {
    if (interactive) {
      rl.prompt();
    }

    return;
  }

  say(bot.transform(input));

  if (bot.quit) {
    rl.close();
    return;
  }

  if (interactive) {
    rl.prompt();
  }
});

rl.on('SIGINT', () => {
  say(bot.getFinal());
  rl.close();
});

