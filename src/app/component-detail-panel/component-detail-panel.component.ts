import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-component-detail-panel',
  templateUrl: './component-detail-panel.component.html',
  styleUrls: ['./component-detail-panel.component.scss']
})
export class ComponentDetailPanelComponent implements OnInit {

  public openedObjects: any
  public selectedPanelID!: string
  public openedObjectIDs: any
  constructor() { }

  ngOnInit(): void {
    this.openedObjects = {}
    this.selectedPanelID = ""
  }

  public openObjectDetail(type: string, object: any) {
    // console.log(object)
    if (!object.id)
      return;
    if (!this.openedObjects.hasOwnProperty(object.id)) {
      this.openedObjects[object.id] = object
      this.openedObjects[object.id]["type"] = type
      this.openedObjectIDs = Object.keys(this.openedObjects)
      console.log(this.openedObjectIDs)
    }
    this.selectedPanelID = object.id
  }
  public selectPanel(objectID: string) {
    this.selectedPanelID = objectID
  }
  public closePanel(objectID: string) {
    delete this.openedObjects[objectID]
    this.openedObjectIDs = Object.keys(this.openedObjects)
    if (objectID == this.selectedPanelID) {
      if (this.openedObjectIDs.length > 0) {
        this.selectedPanelID = this.openedObjectIDs[this.openedObjectIDs.length - 1]
      }
      else
        this.selectedPanelID = ""
    }

  }
}
