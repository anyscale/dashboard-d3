import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentBarComponent } from './component-bar.component';

describe('ComponentBarComponent', () => {
  let component: ComponentBarComponent;
  let fixture: ComponentFixture<ComponentBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
