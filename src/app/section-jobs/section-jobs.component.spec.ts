import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionJobsComponent } from './section-jobs.component';

describe('SectionJobsComponent', () => {
  let component: SectionJobsComponent;
  let fixture: ComponentFixture<SectionJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SectionJobsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
