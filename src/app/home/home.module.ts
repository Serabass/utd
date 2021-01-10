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

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, SharedModule, HomeRoutingModule,
    NzListModule,
    NzIconModule,
    NzGridModule,
    NzLayoutModule,
    NzProgressModule,
    NzButtonModule]
})
export class HomeModule {
}

