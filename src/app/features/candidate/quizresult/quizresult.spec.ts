import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Quizresult } from './quizresult';

describe('Quizresult', () => {
  let component: Quizresult;
  let fixture: ComponentFixture<Quizresult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Quizresult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Quizresult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
