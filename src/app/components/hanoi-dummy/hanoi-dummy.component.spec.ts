import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HanoiDummyComponent } from './hanoi-dummy.component';

describe('HanoiDummyComponent', () => {
  let component: HanoiDummyComponent;
  let fixture: ComponentFixture<HanoiDummyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HanoiDummyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HanoiDummyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
