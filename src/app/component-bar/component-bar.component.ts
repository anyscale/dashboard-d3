import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-component-bar',
  templateUrl: './component-bar.component.html',
  styleUrls: ['./component-bar.component.scss']
})
export class ComponentBarComponent implements OnInit {
  @Input() startPos = 0;
  @Input() endPos = 50;
  @Input() colorCode = '#000';

  constructor() { }

  ngOnInit(): void {
  }


}
