import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Signupcorp } from './signupcorp';

describe('Signupcorp', () => {
  let component: Signupcorp;
  let fixture: ComponentFixture<Signupcorp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signupcorp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Signupcorp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
