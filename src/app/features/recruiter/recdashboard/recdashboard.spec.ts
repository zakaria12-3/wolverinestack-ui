import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recdashboard } from './recdashboard';

describe('Recdashboard', () => {
  let component: Recdashboard;
  let fixture: ComponentFixture<Recdashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recdashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recdashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
