import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentDetailPanelComponent } from './component-detail-panel.component';

describe('ComponentDetailPanelComponent', () => {
  let component: ComponentDetailPanelComponent;
  let fixture: ComponentFixture<ComponentDetailPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentDetailPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentDetailPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
