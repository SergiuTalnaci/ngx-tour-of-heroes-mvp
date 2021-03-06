import { fakeAsync, tick } from '@angular/core/testing';
import {
  asyncScheduler,
  Observable,
  Observer,
  Subject,
  Subscription,
} from 'rxjs';
import { observeOn } from 'rxjs/operators';

import { femaleMarvelHeroes } from '../../test/female-marvel-heroes';
import { Hero } from '../hero';
import { HeroService } from '../hero.service';
import { HeroSearchContainerComponent } from './hero-search.container';

describe('HeroSearchContainerComponent', () => {
  let container: HeroSearchContainerComponent;
  let heroesSpy: jasmine.Spy;
  let heroesSubscription: Subscription;
  let heroSearch: Subject<Hero[]>;
  let heroSearchSubscriptionCount: number;
  let heroServiceStub: Partial<HeroService>;

  beforeEach(() => {
    heroSearch = new Subject();
    heroSearchSubscriptionCount = 0;
    const heroSearch$: Observable<Hero[]> = Observable.create(
      (observer: Observer<Hero[]>): () => void => {
        const routeParametersSubscription: Subscription = heroSearch
          .subscribe(observer);
        heroSearchSubscriptionCount += 1;

        return (): void => {
          routeParametersSubscription.unsubscribe();
          heroSearchSubscriptionCount -= 1;
        };
      });
    heroServiceStub = {
      searchHeroes(): Observable<Hero[]> {
        return heroSearch$.pipe(
          observeOn(asyncScheduler),
        );
      }
    };
    spyOn(heroServiceStub, 'searchHeroes').and.callThrough();
    container = new HeroSearchContainerComponent(
      heroServiceStub as HeroService);
  });

  beforeEach(() => {
    heroesSpy = jasmine.createSpy('heroesSpy');
    heroesSubscription = container.heroes$.subscribe(heroesSpy);
  });

  afterEach(() => {
    heroesSubscription.unsubscribe();
  });

  describe('emits filtered heroes', () => {
    it('when the user searches', fakeAsync(() => {
      const missMarvel = 'ms. marvel';

      container.search(missMarvel);
      heroSearch.next(femaleMarvelHeroes);
      tick();

      expect(heroesSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('and delegates search', () => {
    it(`to ${HeroService.prototype.constructor.name}`, () => {
      const storm = 'storm';
      const medusa = 'medusa';

      container.search(storm);

      expect(heroServiceStub.searchHeroes).toHaveBeenCalledTimes(1);
      expect(heroServiceStub.searchHeroes).toHaveBeenCalledWith(storm);
      container.search(medusa);

      expect(heroServiceStub.searchHeroes).toHaveBeenCalledTimes(2);
      expect(heroServiceStub.searchHeroes).toHaveBeenCalledWith(medusa);
    });

    it('and switches subscriptions when a new search is performed', () => {
      const rogue = 'rogue';
      const blackWidow = 'black widow';
      const captainMarvel = 'captain marvel';

      expect(heroSearchSubscriptionCount).toBe(0);
      container.search(rogue);

      expect(heroSearchSubscriptionCount).toBe(1);
      container.search(blackWidow);

      expect(heroSearchSubscriptionCount).toBe(1);
      container.search(captainMarvel);

      expect(heroSearchSubscriptionCount).toBe(1);
    });
  });
});
