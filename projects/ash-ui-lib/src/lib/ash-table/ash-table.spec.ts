import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AshTable } from './ash-table';

describe('AshTable', () => {
  let component: AshTable;
  let fixture: ComponentFixture<AshTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AshTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AshTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
