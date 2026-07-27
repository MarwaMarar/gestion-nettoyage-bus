import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinNettoyagePage } from './fin-nettoyage.page';

describe('FinNettoyagePage', () => {
  let component: FinNettoyagePage;
  let fixture: ComponentFixture<FinNettoyagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FinNettoyagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
