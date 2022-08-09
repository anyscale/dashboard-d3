import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentCardMainComponent } from './component-card-main.component';

describe('ComponentCardMainComponent', () => {
  let component: ComponentCardMainComponent;
  let fixture: ComponentFixture<ComponentCardMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentCardMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentCardMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
