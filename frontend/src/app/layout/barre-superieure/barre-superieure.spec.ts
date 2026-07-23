import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarreSuperieureComponent } from './barre-superieure';

describe('BarreSuperieure', () => {
  let component: BarreSuperieureComponent;
  let fixture: ComponentFixture<BarreSuperieureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarreSuperieureComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarreSuperieureComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
