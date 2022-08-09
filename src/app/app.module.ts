import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageHomeComponent } from './page-home/page-home.component';
import { ComponentCardMainComponent } from './component-card-main/component-card-main.component';
import { ComponentBarComponent } from './component-bar/component-bar.component';
import { SectionJobsComponent } from './section-jobs/section-jobs.component';
import { SectionNodesComponent } from './section-nodes/section-nodes.component';
import { ComponentDetailPanelComponent } from './component-detail-panel/component-detail-panel.component';
import { ComponentTimelineComponent } from './component-timeline/component-timeline.component';

@NgModule({
  declarations: [
    AppComponent,
    PageHomeComponent,
    ComponentCardMainComponent,
    ComponentBarComponent,
    SectionJobsComponent,
    SectionNodesComponent,
    ComponentDetailPanelComponent,
    ComponentTimelineComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
