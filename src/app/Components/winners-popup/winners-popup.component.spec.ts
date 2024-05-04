import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnersPopupComponent } from './winners-popup.component';

describe('WinnersPopupComponent', () => {
  let component: WinnersPopupComponent;
  let fixture: ComponentFixture<WinnersPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinnersPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WinnersPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
