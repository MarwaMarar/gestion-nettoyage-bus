import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarreLaterale } from './barre-laterale';
import { provideRouter } from '@angular/router';

describe('BarreLaterale', () => {
  let component: BarreLaterale;
  let fixture: ComponentFixture<BarreLaterale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarreLaterale],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BarreLaterale);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
