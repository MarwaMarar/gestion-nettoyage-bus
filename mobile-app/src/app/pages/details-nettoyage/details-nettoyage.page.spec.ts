import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsNettoyagePage } from './details-nettoyage.page';

describe('DetailsNettoyagePage', () => {
  let component: DetailsNettoyagePage;
  let fixture: ComponentFixture<DetailsNettoyagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsNettoyagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
