import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Signupmain } from './signupmain';

describe('Signupmain', () => {
  let component: Signupmain;
  let fixture: ComponentFixture<Signupmain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signupmain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Signupmain);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
