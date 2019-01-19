// @flow
import { maxBy, meanBy } from 'lodash';

export type Score<T, F> = { individual: T, fitness: F };
export type Stats<T, F> = { best: T, avg: F, max: F };

export default class Genetic<T, F = number> {
  // Managed
  population: T[] = [];
  generation: number = 0;
  lastStats: ?Stats<T, F>;

  // Configurable
  fitness: T => F;
  select: (Score<T, F>[]) => [T, T];
  mate: (T, T) => [T, T];
  mutate: T => T;

  // Configurable with Defaults
  shouldMate: (mom: T, dad: T) => boolean = Genetic.withProbability(0.3);
  mutationOccursFor: (individual: T) => boolean = Genetic.withProbability(0.1);
  statInterval: number = 10;
  onUpdate: ?(Stats<T, F>) => void = null;

  // $FlowIssue - just assume & error later if not true
  toComparable: F => number | string = f => f;

  constructor(initialPopulation?: T[]) {
    console.log('~~ let there be light ~~');
    this.population = initialPopulation || [];
  }

  withGenesis: (T[]) => Genetic<T, F> = withPop => {
    console.log('~~ let the earth bring forth the living creature ~~');
    this.population = withPop;
    return this;
  };

  withFitness: ((T) => F) => Genetic<T, F> = fitness => {
    this.fitness = fitness;
    return this;
  };

  selectingOn: ((Score<T, F>[]) => [T, T]) => Genetic<T, F> = select => {
    this.select = select;
    return this;
  };

  matingBy: ((T, T) => [T, T]) => Genetic<T, F> = mate => {
    this.mate = mate;
    return this;
  };

  doOnUpdates: ((Stats<T, F>) => void) => Genetic<T, F> = onUpdate => {
    this.onUpdate = onUpdate;
    return this;
  };

  mutatingBy: ((T) => T) => Genetic<T, F> = mutate => {
    this.mutate = mutate;
    return this;
  };

  withStatsEvery: number => Genetic<T, F> = statInterval => {
    this.statInterval = statInterval;
    return this;
  };

  evolve: () => Promise<Stats<T, F>> = () => {
    return this.evolveWhile(g => g <= 100);
  };

  evolveWhile: (
    (generation: number, lastStats: ?Stats<T, F>) => boolean
  ) => Promise<Stats<T, F>> = async _while => {
    while (_while(this.generation, this.lastStats)) {
      this.generation++;
      if (this.generation % this.statInterval === 0) {
        this.lastStats = Genetic.statsFor(this);
        console.log(`gen ${this.generation}`, this.lastStats);
        // $FlowIssue
        this.onUpdate && this.onUpdate(this.lastStats);
      }
      this.population = await this.nextGen();
    }
    const results = Genetic.statsFor(this);
    console.log(`finished over ${this.generation} generations`);
    console.log('results', results);
    this.onUpdate && this.onUpdate(results);
    return results;
  };

  nextGen: () => Promise<T[]> = async () => {
    if (!this.population.length) {
      throw Error('empty population');
    }
    return new Promise(r => {
      const popPrime = [];
      const scores = Genetic.computeScores(this);
      while (popPrime.length < this.population.length) {
        let [adam, eve] = this.select(scores);
        if (this.shouldMate(adam, eve)) {
          [adam, eve] = this.mate(adam, eve);
        }
        [adam, eve] = [adam, eve].map(i => (this.mutationOccursFor(i) ? this.mutate(i) : i));
        popPrime.push(adam, eve);
      }
      r(popPrime);
    });
  };

  static computeScores<Type, Fitness>(ga: Genetic<Type, Fitness>): Score<Type, Fitness>[] {
    return ga.population.map(p => ({ individual: p, fitness: ga.fitness(p) }));
  }

  static withProbability(p: number): () => boolean {
    return () => Math.random() <= p;
  }

  static statsFor<Type, Fitness>(ga: Genetic<Type, Fitness>): Stats<Type, Fitness> {
    try {
      const scores = this.computeScores(ga);
      const best = maxBy(scores, s => ga.toComparable(s.fitness));
      const avg = meanBy(scores, s => ga.toComparable(s.fitness));
      return { best: best.individual, avg, max: best.fitness };
    } catch (e) {
      console.error(e, 'make sure you provide a `toComparable` for your Fitness Type');
      throw e;
    }
  }
}
