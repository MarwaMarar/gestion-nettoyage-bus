import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListeNettoyagesPage } from './liste-nettoyages.page';

describe('ListeNettoyagesPage', () => {
  let component: ListeNettoyagesPage;
  let fixture: ComponentFixture<ListeNettoyagesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeNettoyagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
