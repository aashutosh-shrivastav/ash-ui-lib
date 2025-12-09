import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AshCalander } from './ash-calander';

describe('AshCalander', () => {
  let component: AshCalander;
  let fixture: ComponentFixture<AshCalander>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AshCalander]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AshCalander);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
