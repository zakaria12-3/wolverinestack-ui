import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizPass } from './quiz-pass';

describe('QuizPass', () => {
  let component: QuizPass;
  let fixture: ComponentFixture<QuizPass>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizPass]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizPass);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
