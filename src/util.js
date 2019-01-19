// @flow
import { sortBy, reverse, sample } from 'lodash';
import type { Score } from './index';

export class Alphabet<T> {
  letters: T[];
  constructor(letters: T[]) {
    this.letters = letters;
  }

  sample(): T {
    return sample(this.letters);
  }

  sampleOfLen(len: number): T[] {
    return [...Array(len)].reduce(
      a => a.concat(this.letters[~~(Math.random() * this.letters.length)]),
      []
    );
  }
}

// noinspection SpellCheckingInspection
export const Alphabets: { [string]: Alphabet<any> } = {
  Words: new Alphabet(' abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
  Binary: new Alphabet([0, 1]),
};

export function replaceAt(str: string, index: number, character: string): string {
  return str.substr(0, index) + character + str.substr(index + character.length);
}

export function weightedRandom<T>(list: Score<T, number>[]): T {
  const scaled = list.map(score => 2 ** score.fitness);
  const scaledTotal = scaled.reduce((p, c) => p + c, 0);
  const normed = reverse(
    sortBy(
      scaled.map((v, i) => ({ item: list[i].individual, normScore: v / scaledTotal })),
      o => o.normScore
    )
  );
  const num = Math.random();
  let s = 0;
  const lastIndex = normed.length - 1;
  for (let i = 0; i < lastIndex; ++i) {
    s += normed[i].normScore;
    if (num < s) {
      return normed[i].item;
    }
  }
  return normed[lastIndex].item;
}
