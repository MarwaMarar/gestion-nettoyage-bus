import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarreSuperieure } from './barre-superieure';

describe('BarreSuperieure', () => {
  let component: BarreSuperieure;
  let fixture: ComponentFixture<BarreSuperieure>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarreSuperieure],
    }).compileComponents();

    fixture = TestBed.createComponent(BarreSuperieure);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
