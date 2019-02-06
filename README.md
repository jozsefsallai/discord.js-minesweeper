# Discord.js Minesweeper

A Minesweeper generator library for Discord.

## Advantages

  * Runs pretty smooth.
  * It's very easy to use.
  * Supports multiple return formats.
  * Highly customizable.
  * No dependencies.
  * Written in TypeScript.

## Usage

First, you need to add the library to your project (duh!):

```sh
npm install discord.js-minesweeper
# or
yarn add discord.js-minesweeper
```

Import it and use it as you wish!

```js
const Minesweeper = require('discord.js-minesweeper');

// ...

const minesweeper = new Minesweeper();
minesweeper.start();
// Returns a Discord-interpretable string with a 9x9 matrix of spoilers and emojis, 10 of which are mines.

const minesweeper = new Minesweeper({
  rows: 12,
  columns: 16,
  mines: 20,
  emote: 'tada',
  returnType: 'code',
});
minesweeper.start();
// Returns a Discord-interpretable code block with a 12x16 matrix of spoilers and emojis, 20 of which are mines that will appear as the :tada: emote.
```

### Options

  * **rows** *(number)* - The number of rows in the mine field. Defaults to 9.
  * **columns** *(number)* - The number of columns in the mine field. Defaults to 9.
  * **mines** *(number)* - The number of mines in the mine field. Defaults to 10.
  * **emote** *(string)* - The emote used as a mine (without colons). Defaults to "boom".
  * **spaces** *(boolean)* - Specifies whether or not the emojis should be surrounded by spaces. Defaults to true.
  * **returnType** *(string)* - The type of the returned data.

### Returned Data

Based on the specified `returnType`, the returned data can vary.
  * `'emoji'` - default value, returns a Discord message format with spoilers and emojis
  * `'code'` - same as 'emoji', but in a code block (i.e. for copying)
  * `'matrix'` - the matrix array itself.

If a mine field is not possible with the provided data (i.e. too many mines), it will return `null`. 

## Examples

### Discord.js

```js
const Discord = require('discord.js');
const Minesweeper = require('discord.js-minesweeper');

const bot = new Discord.Client();

bot.on('message', function (message) {
  const content = message.content.split(' ');
  const args = content.slice(1);

  if (content[0] === '.minesweeper') {
    const rows = parseInt(args[0]);
    const columns = parseInt(args[1]);
    const mines = parseInt(args[2]);

    if (!rows) {
      return message.channel.send(':warning: Please provide the number of rows.');
    }

    if (!columns) {
      return message.channel.send(':warning: Please provide the number of columns.');
    }

    if (!mines) {
      return message.channel.send(':warning: Please provide the number of mines.');
    }

    const minesweeper = new Minesweeper({ rows, columns, mines });
    const matrix = minesweeper.start();

    return matrix
      ? message.channel.send(matrix)
      : message.channel.send(':warning: You have provided invalid data.');
  }
});

bot.login(TOKEN);
```

### Commando

```js
const { Command } = require('discord.js-commando');
const Minesweeper = require('discord.js-minesweeper');

class MinesweeperCommand extends Command {
  constructor(client) {
    super(client, {
      // ...
      args: [
        {
          key: 'rows',
          prompt: 'How many rows?',
          type: 'integer',
          min: 4,
          max: 20
        },
        {
          key: 'columns',
          prompt: 'How many columns?',
          type: 'integer',
          min: 4,
          max: 20
        },
        {
          key: 'mines',
          prompt: 'How many mines?',
          type: 'integer',
          min: 1
        }
      ]
    });
  }

  async run(message, { rows, columns, mines }) {
    const minesweeper = new Minesweeper({ rows, columns, mines });
    const matrix = minesweeper.start();

    return matrix
      ? message.say(matrix)
      : message.say(':warning: The provided data is invalid.');
  }
};

module.exports = MinesweeperCommand;
```

## License

MIT.
