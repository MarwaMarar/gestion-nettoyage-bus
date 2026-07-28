import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsSuperviseurPage } from './notifications-superviseur.page';

describe('NotificationsSuperviseurPage', () => {
  let component: NotificationsSuperviseurPage;
  let fixture: ComponentFixture<NotificationsSuperviseurPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsSuperviseurPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
