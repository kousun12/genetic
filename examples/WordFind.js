// @flow

import { times, get, sample } from 'lodash';
import type { Stats } from 'genetic';
import Genetic from 'genetic';
import { weightedRandom, replaceAt, Alphabets } from 'genetic/util';

const { Words } = Alphabets;

const solution = 'the music';
const len = solution.length;
console.log('SOLUTION', solution);

document.addEventListener('DOMContentLoaded', () => {
  const sol = document.createElement('p');
  sol.textContent = 'solution: ' + solution;
  const b = document.createElement('p');
  b.textContent = 'best: ';
  if (document.body) {
    document.body.appendChild(sol);
    // $FlowIssue
    document.body.appendChild(b);
  }
  setTimeout(
    () =>
      start(s => {
        b.innerHTML = 'best: ' + s.best;
      }),
    1000
  );
});

function start(doOnUpdates: (Stats<string, number>) => void) {
  const stringFinder: Genetic<string, number> = new Genetic()
    .withGenesis(times(250, () => Words.sampleOfLen(len).join('')))
    .matingBy((mother, father) => {
      const len = mother.length;
      let c1 = Math.floor(Math.random() * len);
      let c2 = Math.floor(Math.random() * len);
      if (c1 > c2) {
        [c1, c2] = [c2, c1];
      }
      const mid = c2 - c1;
      const son = father.substr(0, c1) + mother.substr(c1, mid) + father.substr(c2);
      const daughter = mother.substr(0, c1) + father.substr(c1, mid) + mother.substr(c2);
      return [son, daughter];
    })
    .mutatingBy(s => {
      const i = Math.floor(Math.random() * s.length);
      return replaceAt(s, i, Words.sample());
    })
    .selectingOn(list => [weightedRandom(list), weightedRandom(list)])
    .withStatsEvery(100)
    .doOnUpdates(doOnUpdates)
    .withFitness(w => {
      let correct = 0;
      for (let i = 0; i < len; i++) {
        if (w.charAt(i) === solution.charAt(i)) {
          correct++;
        }
      }
      return correct / len;
    });
  stringFinder.evolveWhile((i, s) => get(s, 'max') !== 1);
}
