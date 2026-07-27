import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuperviseurDashboardPage } from './superviseur-dashboard.page';

describe('SuperviseurDashboardPage', () => {
  let component: SuperviseurDashboardPage;
  let fixture: ComponentFixture<SuperviseurDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperviseurDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
