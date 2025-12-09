import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AshForm } from './ash-form';

describe('AshForm', () => {
  let component: AshForm;
  let fixture: ComponentFixture<AshForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AshForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AshForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
