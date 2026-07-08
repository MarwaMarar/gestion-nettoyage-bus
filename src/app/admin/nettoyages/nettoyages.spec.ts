import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nettoyages } from './nettoyages';

describe('Nettoyages', () => {
  let component: Nettoyages;
  let fixture: ComponentFixture<Nettoyages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nettoyages],
    }).compileComponents();

    fixture = TestBed.createComponent(Nettoyages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
