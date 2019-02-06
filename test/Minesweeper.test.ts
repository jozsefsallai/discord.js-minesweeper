import { expect } from 'chai';
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
      expect(minesweeper.returnType).to.eql('emoji');
      expect(minesweeper.types.mine).to.eql('|| :boom: ||');
      expect(minesweeper.types.numbers[1]).to.eql('|| :one: ||');
    });

    it('should set custom props', function () {
      const minesweeper = new Minesweeper({
        rows: 20,
        columns: 10,
        mines: 20,
        emote: 'tada',
        spaces: false
      });

      expect(minesweeper.rows).to.eql(20);
      expect(minesweeper.columns).to.eql(10);
      expect(minesweeper.mines).to.eql(20);
      expect(minesweeper.emote).to.eql('tada');
      expect(minesweeper.spaces).to.eql(false);
      expect(minesweeper.types.mine).to.eql('||:tada:||');
      expect(minesweeper.types.numbers[1]).to.eql('||:one:||');
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
