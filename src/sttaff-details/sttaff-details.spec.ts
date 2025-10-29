import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SttaffDetails } from './sttaff-details';

describe('SttaffDetails', () => {
  let component: SttaffDetails;
  let fixture: ComponentFixture<SttaffDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SttaffDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SttaffDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
