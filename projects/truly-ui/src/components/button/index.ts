import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TlButton } from './button';
import { TabIndexService } from '../form/tabIndex.service';
import { IdGeneratorService } from '../core/helper/idgenerator.service';
import { NameGeneratorService } from '../core/helper/namegenerator.service';
import { ModalModule } from '../modal';
import { MiscModule } from '../misc';

export * from './button';

@NgModule({
    imports: [
        CommonModule,
        MiscModule,
        ModalModule
    ],
    declarations: [
        TlButton,
    ],
    exports: [
        TlButton,
    ],
    providers: [
        TabIndexService,
        IdGeneratorService,
        NameGeneratorService
    ]
})
export class ButtonModule {}
