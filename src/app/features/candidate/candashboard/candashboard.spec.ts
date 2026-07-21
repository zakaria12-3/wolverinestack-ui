import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Candashboard } from './candashboard';

describe('Candashboard', () => {
  let component: Candashboard;
  let fixture: ComponentFixture<Candashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Candashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Candashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
