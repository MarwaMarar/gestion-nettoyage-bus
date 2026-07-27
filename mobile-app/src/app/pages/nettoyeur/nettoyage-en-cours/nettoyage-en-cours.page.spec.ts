import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NettoyageEnCoursPage } from './nettoyage-en-cours.page';

describe('NettoyageEnCoursPage', () => {
  let component: NettoyageEnCoursPage;
  let fixture: ComponentFixture<NettoyageEnCoursPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NettoyageEnCoursPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
