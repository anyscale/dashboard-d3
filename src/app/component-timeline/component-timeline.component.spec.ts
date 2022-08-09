import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentTimelineComponent } from './component-timeline.component';

describe('ComponentTimelineComponent', () => {
  let component: ComponentTimelineComponent;
  let fixture: ComponentFixture<ComponentTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentTimelineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
