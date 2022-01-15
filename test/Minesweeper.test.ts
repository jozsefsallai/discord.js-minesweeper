import { expect } from 'chai';
import seedrandom from 'seedrandom';
import Minesweeper from '../src/Minesweeper';

describe('Minesweeper', function () {
  describe('@constructor', function () {
    it('should set defaults', function () {
      const minesweeper = new Minesweeper();
      expect(minesweeper.rows).to.eql(9);
      expect(minesweeper.columns).to.eql(9);
      expect(minesweeper.mines).to.eql(10);
      expect(minesweeper.emote).to.eql('boom');
      expect(minesweeper.spaces).to.eql(true);
      expect(minesweeper.revealFirstCell).to.eql(false);
      expect(minesweeper.zeroFirstCell).to.eql(true);
      expect(minesweeper.returnType).to.eql('emoji');
      expect(minesweeper.types.mine).to.eql('|| :boom: ||');
      expect(minesweeper.types.numbers[1]).to.eql('|| :one: ||');
      expect(minesweeper.safeCells).to.be.empty;
    });

    it('should set custom props', function () {
      const minesweeper = new Minesweeper({
        rows: 20,
        columns: 10,
        mines: 20,
        emote: 'tada',
        spaces: false,
        revealFirstCell: true
      });

      expect(minesweeper.rows).to.eql(20);
      expect(minesweeper.columns).to.eql(10);
      expect(minesweeper.mines).to.eql(20);
      expect(minesweeper.emote).to.eql('tada');
      expect(minesweeper.spaces).to.eql(false);
      expect(minesweeper.revealFirstCell).to.eql(true);
      expect(minesweeper.types.mine).to.eql('||:tada:||');
      expect(minesweeper.types.numbers[1]).to.eql('||:one:||');
    });

    it('should use custom RNG function', function () {
      const rng = seedrandom('kozakura');
      
      const first = new Minesweeper({
        rows: 10,
        columns: 10,
        mines: 20,
        rng
      });

      const second = new Minesweeper({
        rows: 10,
        columns: 10,
        mines: 20,
        rng
      });

      expect(first.matrix).to.eql(second.matrix);
    });
  });

  describe('#spoilerize', function () {
    it('should turn text into a Discord spoiler tag', function () {
      const minesweeper = new Minesweeper();
      return expect(minesweeper.spoilerize('hello')).to.eql('|| :hello: ||');
    });

    it('should not surround text with spaces when specified', function () {
      const minesweeper = new Minesweeper({ spaces: false });
      return expect(minesweeper.spoilerize('hello')).to.eq('||:hello:||');
    });
  });

  describe('#generateEmptyMatrix', function () {
    it('should generate an empty matrix', function () {
      const minesweeper = new Minesweeper();
      minesweeper.generateEmptyMatrix();
      expect(minesweeper.matrix).to.not.eql([]);
      expect(minesweeper.matrix[0][0]).to.eql('|| :zero: ||');
    });

    it('should generate the matrix based on the given size', function () {
      const minesweeper = new Minesweeper({ rows: 15, columns: 8 });
      minesweeper.generateEmptyMatrix();

      expect(minesweeper.matrix).to.have.length(15);
      expect(minesweeper.matrix[0]).to.have.length(8);
    });
  });

  describe('#plantMines', function () {
    it('should plant mines properly', function () {
      const minesweeper = new Minesweeper({ rows: 2, columns: 2, mines: 1 });
      minesweeper.generateEmptyMatrix();
      minesweeper.plantMines();
      const zeroArray = [
        [ '|| :zero: ||', '|| :zero: ||' ],
        [ '|| :zero: ||', '|| :zero: ||' ]
      ];

      return expect(minesweeper.matrix).to.not.eql(zeroArray);
    });
  });

  describe('#getNumberOfMines', function () {
    beforeEach(function () {
      this.minesweeper = new Minesweeper();
      this.minesweeper.generateEmptyMatrix();
      this.minesweeper.matrix[2][3] = this.minesweeper.types.mine;
      this.minesweeper.matrix[1][1] = this.minesweeper.types.mine;
    });

    it('should return the mine if the provided cell is a mine', function () {
      return expect(this.minesweeper.getNumberOfMines(2, 3)).to.eql(this.minesweeper.types.mine);
    });

    it('should return proper number of surrounding mines', function () {
      return expect(this.minesweeper.getNumberOfMines(2, 2)).to.eql('|| :two: ||');
    });
  });

  describe('#getTextRepresentation', function () {
    it('should return matrix as a text', function () {
      const minesweeper = new Minesweeper({ rows: 2, columns: 2 });
      minesweeper.generateEmptyMatrix();

      const output = '|| :zero: || || :zero: ||\n|| :zero: || || :zero: ||';
      return expect(minesweeper.getTextRepresentation()).to.eql(output);
    });

    it('should return no spaces between the cells if set', function () {
      const minesweeper = new Minesweeper({ rows: 2, columns: 2, spaces: false });
      minesweeper.generateEmptyMatrix();

      const output = '||:zero:||||:zero:||\n||:zero:||||:zero:||';
      return expect(minesweeper.getTextRepresentation()).to.eql(output);
    });
  });

  describe('#populate', function () {
    function countNonMines(matrix: string[][]): number {
      let counter: number = 0;

      matrix.forEach(row => {
        row.forEach(column => {
          if (column !== '||:boom:||') {
            counter++;
          }
        });
      });

      return counter;
    }

    it('should populate the board', function () {
      const minesweeper = new Minesweeper({ rows: 3, columns: 3, mines: 1, spaces: false });
      minesweeper.generateEmptyMatrix();
      minesweeper.plantMines();
      minesweeper.populate();

      const nonMines = countNonMines(minesweeper.matrix);
      return expect(nonMines).to.eql(8);
    });
  });

  describe('#revealFirst', function () {
    function countRevealedCells(matrix: string[][]): number {
      let counter: number = 0;

      matrix.forEach(row => {
        row.forEach(column => {
          if (!column.includes('||')) {
            counter++;
          }
        });
      });

      return counter;
    }

    describe('when revealFirstCell is false', function () {
      it('should return null', function () {
        const minesweeper = new Minesweeper({ rows: 2, columns: 2, mines: 1 });
        return expect(minesweeper.revealFirst()).to.eql({
          x: -1,
          y: -1
        });
      });
    });

    describe('when revealFirstCell is true', function () {
      describe('when zeroFirstCell is false', function() {
        it('should change a random field', function () {
          const minesweeper = new Minesweeper({
            rows: 5,
            columns: 5,
            mines: 6,
            revealFirstCell: true,
            zeroFirstCell: false,
            spaces: false
          });
          minesweeper.generateEmptyMatrix();
          minesweeper.plantMines();
          minesweeper.populate();

          const revealed = minesweeper.revealFirst();
          const x: number = revealed.x;
          const y: number = revealed.y;

          const target: string = minesweeper.matrix[x][y];

          return expect(target.startsWith('||')).to.be.false;
        });
      });

      describe('when zeroFirstCell is true', function() {
        it('should change a zero field when one exists', function () {
          const minesweeper = new Minesweeper({
            rows: 4,
            columns: 4,
            mines: 2,
            revealFirstCell: true,
            zeroFirstCell: true,
            spaces: false
          });
          minesweeper.generateEmptyMatrix();
          minesweeper.plantMines();
          minesweeper.populate();

          const revealed = minesweeper.revealFirst();
          const x: number = revealed.x;
          const y: number = revealed.y;

          const target: string = minesweeper.matrix[x][y];

          expect(target.startsWith('||')).to.be.false;
          expect(target).to.eql(':zero:');
        });

        it('should reveal multiple fields when a zero field exists', function () {
          const minesweeper = new Minesweeper({
            rows: 4,
            columns: 4,
            mines: 2,
            revealFirstCell: true,
            zeroFirstCell: true,
            spaces: false
          });
          minesweeper.generateEmptyMatrix();
          minesweeper.plantMines();
          minesweeper.populate();

          minesweeper.revealFirst();
          const revealed: number = countRevealedCells(minesweeper.matrix);

          expect(revealed).to.be.greaterThan(1);
        });

        it('should only change one field when no zero fields exist', function () {
          const minesweeper = new Minesweeper({
            rows: 2,
            columns: 2,
            mines: 1,
            revealFirstCell: true,
            zeroFirstCell: true,
            spaces: false
          });
          minesweeper.generateEmptyMatrix();
          minesweeper.plantMines();
          minesweeper.populate();

          minesweeper.revealFirst();
          const revealed: number = countRevealedCells(minesweeper.matrix);

          expect(revealed).to.eql(1);
        });
      });

    });
  });

  describe('#revealSurroundings', function () {
    function countHiddenCells(matrix: string[][]): number {
      let counter: number = 0;

      matrix.forEach(row => {
        row.forEach(column => {
          if (column.includes('||')) {
            counter++;
          }
        });
      });

      return counter;
    }

    describe('when there are no mines', function() {
      describe('when recurse is false', function() {
        it('should result in nine revealed cells', function () {
          const minesweeper = new Minesweeper({
            rows: 5,
            columns: 5,
            mines: 0,
            revealFirstCell: false
          });
          minesweeper.generateEmptyMatrix();

          minesweeper.revealSurroundings({x: 2, y: 2}, false);
          const totalCells: number = minesweeper.rows * minesweeper.columns;
          const hidden: number = countHiddenCells(minesweeper.matrix);

          expect(totalCells - hidden).to.eql(9);
        });
      });

      describe('when recurse is true', function() {
        it('should result in no hidden cells ', function () {
          const minesweeper = new Minesweeper({
            rows: 5,
            columns: 5,
            mines: 0,
            revealFirstCell: false
          });
          minesweeper.generateEmptyMatrix();

          minesweeper.revealSurroundings({x: 2, y: 2}, true);
          const hidden: number = countHiddenCells(minesweeper.matrix);

          expect(hidden).to.eql(0);
        });
      });
    });

    describe('when there are mines', function() {
      describe('when recurse is true', function() {
        function isZeroCell(cell: {x: number, y: number}, minesweeper: Minesweeper): boolean {
          if (minesweeper.matrix[cell.x][cell.y] == minesweeper.types.numbers[0]) {
            return true;
          }
          return false;
        }

        it('should reveal multiple cells', function () {
          const minesweeper = new Minesweeper({
            rows: 5,
            columns: 5,
            mines: 1,
            revealFirstCell: false
          });
          minesweeper.generateEmptyMatrix();
          minesweeper.plantMines();
          minesweeper.populate();

          const zeroCell = minesweeper.safeCells.filter(c => isZeroCell(c, minesweeper))[0]
          minesweeper.revealSurroundings(zeroCell, true);
          const totalCells: number = minesweeper.rows * minesweeper.columns;
          const hidden: number = countHiddenCells(minesweeper.matrix);

          expect(hidden).to.be.lessThan(totalCells);
        })

        it('should leave some cells hidden', function () {
          const minesweeper = new Minesweeper({
            rows: 5,
            columns: 5,
            mines: 1,
            revealFirstCell: false
          });
          minesweeper.generateEmptyMatrix();
          minesweeper.plantMines();
          minesweeper.populate();

          const zeroCell = minesweeper.safeCells.filter(c => isZeroCell(c, minesweeper))[0]
          minesweeper.revealSurroundings(zeroCell, true);
          const hidden: number = countHiddenCells(minesweeper.matrix);

          expect(hidden).to.be.greaterThan(0);
        });
      });
    });
  });

  describe('#start', function () {
    it('should return null for invalid minesweeper options', function () {
      const minesweeper = new Minesweeper({ rows: 2, columns: 2, mines: 200 });
      return expect(minesweeper.start()).to.be.null;
    });

    it('should return emoji', function () {
      const minesweeper = new Minesweeper({ returnType: 'emoji' });
      return expect(minesweeper.start()).to.be.a('string');
    });

    it('should return code', function () {
      const minesweeper = new Minesweeper({ returnType: 'code' });
      const output = minesweeper.start();
      return expect(`${output}`.startsWith('```')).to.be.true;
    });

    it('should return matrix', function () {
      const minesweeper = new Minesweeper({ returnType: 'matrix' });
      const output = minesweeper.start();
      expect(output).to.be.an('array');
      expect(output && output[0]).to.be.an('array');
    });
  });
});
