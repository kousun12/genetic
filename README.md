## genetic

this is a small js framework to describe and run genetic algorithms. The main class exposed is `Genetic<Type, Fitness>`. The process of describing an evolving ecology is done via a fluent api:

For example: a word finder:

```javascript
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
``` 

### basic docs


```javascript
withGenesis: (T[]) => Genetic<T, F>
```
populate the world with an initial population

```javascript
withFitness: ((T) => F) => Genetic<T, F>
```
describe a global fitness function, i.e. given a member of the population, statically compute a measure of fitness. If the Fitness measure is not implicitly comparable, you must implement a comparator.


```javascript
selectingOn: ((Score<T, F>[]) => [T, T]) => Genetic<T, F>
```
Given a scored population, decide a way to select for mating in the new population. 

```javascript
matingBy: ((T, T) => [T, T]) => Genetic<T, F>
```
Given two members chosen to mate, decide how genetic crossover works.


```javascript
mutatingBy: ((T, T) => [T, T]) => Genetic<T, F>
```
Given two members chosen to mate, decide how random mutation works.

```javascript
shouldMate: (mom: T, dad: T) => boolean
```
Given a pair selected to mate, decide whether or not they are to mate. Likely you want to use a probability heuristic here, e.g. `shouldMate = Genetic.withProbability(0.3)`

```javascript
mutationOccursFor: (individual: T) => boolean
```
Given an individual moving to the next generation, decide whether or not they are subject to random mutation. Likely you want to use a probability heuristic here, e.g. `shouldMate = Genetic.withProbability(0.1)`


