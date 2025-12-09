import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AshUiLib } from './ash-ui-lib';

describe('AshUiLib', () => {
  let component: AshUiLib;
  let fixture: ComponentFixture<AshUiLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AshUiLib]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AshUiLib);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
