import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { HighlightJsModule } from 'ngx-highlight-js';
import { ScheduleModule } from '../../../../../projects/truly-ui/src/components/schedule';
import { ShowcaseCardModule } from '../../../shared/components/showcase-card/showcase-card.module';
import { ShowcaseTableEventsModule } from '../../../shared/components/showcase-table-events/showcase-table-events.module';
import { ShowcaseTablePropertiesModule } from '../../../shared/components/showcase-table-properties/showcase-table-properties.module';
import { ScheduleDemoOverviewRoutingModule } from './scheduledemo-overview-routing.module';
import { ScheduleDemoOverviewComponent } from './scheduledemo-overview.component';

@NgModule({
  imports: [
    ScheduleDemoOverviewRoutingModule,
    ScheduleModule,
    CommonModule,
    FormsModule,
    HighlightJsModule,
    ShowcaseCardModule,
    ShowcaseTablePropertiesModule,
    ShowcaseTableEventsModule
  ],
  declarations: [
    ScheduleDemoOverviewComponent
  ],
  exports: [
    ScheduleDemoOverviewComponent
  ]
})
export class ScheduledemoOverviewModule {}
