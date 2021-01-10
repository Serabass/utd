import {ApplicationRef, Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {ElectronService} from '../core/services';
// import '../sandbox';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public a: any;

  constructor(private router: Router,
              private el: ElectronService,
              private app: ApplicationRef) { }

  async ngOnInit(): Promise<void> {
    this.a = await this.el.load('/Admin/');
  }

  public async checkMd5(entry: any) {
    entry.md5Checked = await entry.checkMD5();
    this.app.tick();
  }

  public async download(entry: any) {
    await entry.download();
    this.app.tick();
  }
}
