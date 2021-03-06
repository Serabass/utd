import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {HomeRoutingModule} from './home-routing.module';

import {HomeComponent} from './home.component';
import {SharedModule} from '../shared/shared.module';
import {NzListModule} from 'ng-zorro-antd/list';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzProgressModule} from 'ng-zorro-antd/progress';
import {IconDefinition} from '@ant-design/icons-angular';
import {
  FolderOutline,
  FileOutline,
  PlusOutline,
  DownloadOutline,
  CheckCircleTwoTone,
  QuestionCircleTwoTone
} from '@ant-design/icons-angular/icons';
import {NzPipesModule} from 'ng-zorro-antd/pipes';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';

const icons: IconDefinition[] = [
  FolderOutline,
  FileOutline,
  PlusOutline,
  DownloadOutline,
  CheckCircleTwoTone,
  QuestionCircleTwoTone
];

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, SharedModule, HomeRoutingModule,
    NzListModule,
    NzIconModule.forRoot(icons),
    NzGridModule,
    NzLayoutModule,
    NzProgressModule,
    NzButtonModule,
    NzToolTipModule,
    NzPipesModule]
})
export class HomeModule {
}

