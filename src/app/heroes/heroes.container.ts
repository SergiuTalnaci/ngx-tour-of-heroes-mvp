import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Hero } from '../hero';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.container.html',
})
export class HeroesContainerComponent implements OnInit {
  private heroes: BehaviorSubject<Hero[]> = new BehaviorSubject([]);
  heroes$: Observable<Hero[]> = this.heroes.asObservable();

  constructor(private heroService: HeroService) {}

  ngOnInit(): void {
    this.heroService.getHeroes()
      .subscribe(
        heroes => this.heroes.next(heroes),
        error => this.heroes.error(error));
  }

  add(name: string): void {
    this.heroService.addHero({ name } as Hero)
      .subscribe(h => this.addHero(h));
  }

  delete(hero: Hero): void {
    this.removeHero(hero);
    this.heroService.deleteHero(hero)
      .subscribe(
        undefined,
        () => this.addHero(hero));
  }

  private addHero(hero: Hero): void {
    this.heroes.next([
      ...this.heroes.value,
      hero,
    ]);
  }

  private removeHero(hero: Hero): void {
    this.heroes.next(this.heroes.value.filter(h => h !== hero));
  }
}
