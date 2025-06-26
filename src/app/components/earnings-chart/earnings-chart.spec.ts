import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarningsChart } from './earnings-chart';

describe('EarningsChart', () => {
  let component: EarningsChart;
  let fixture: ComponentFixture<EarningsChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarningsChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EarningsChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
