import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-component-card-main',
  templateUrl: './component-card-main.component.html',
  styleUrls: ['./component-card-main.component.scss']
})
export class ComponentCardMainComponent implements OnInit {

  @Input() title = '';

  public expanded = false

  constructor() { }

  ngOnInit(): void {
  }

  expand(): void {
    this.expanded = !this.expanded
  }
}
