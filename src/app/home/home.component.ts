import {ApplicationRef, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Directory, ElectronService, Entry, EntrySize, File} from '../core/services';

// import '../sandbox';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public a: Directory;

  constructor(private router: Router,
              private el: ElectronService,
              private app: ApplicationRef) {
  }

  async ngOnInit(): Promise<void> {
    this.a = await this.el.load('/Nexgen/');
  }

  public async checkMd5(entry: File) {
    entry.md5Checked = await entry.checkMD5();
    this.app.tick();
  }

  public async download(entry: Entry) {
    this.app.tick();
    entry.onProgress.subscribe(() => {
      this.app.tick();
    });
    await entry.download();
    await this.checkMd5(entry as File);
    this.app.tick();
  }

  public getPercent(size: EntrySize) {
    return (size.transferred / size.total) * 100;
  }

  public formatPercent(percent: number) {
    return `${percent.toFixed(2)}%`;
  }
}
