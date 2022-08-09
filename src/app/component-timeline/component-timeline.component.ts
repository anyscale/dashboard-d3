import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Input, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3Brush from 'd3-brush'
import { COLOR, LAYOUT } from '../consts';
import { AnonymousSubject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-component-timeline',
  templateUrl: './component-timeline.component.html',
  styleUrls: ['./component-timeline.component.scss']
})
export class ComponentTimelineComponent implements AfterViewInit {

  @ViewChild('timeline')
  globalTimeline!: ElementRef;

  private _metaJsonData!: any
  @Input()
  set metaJsonData(data: any) {
    if (data) {
      this.DEFAULT_START_TIME = data.start_time
      this.DEFAULT_END_TIME = data.end_time
      this.createSvg()
    }
  }

  private _nodeJsonData!: any
  @Input()
  set nodeJsonData(data: any) {
    if (data) {
      this._nodeJsonData = data
      this.buildNodeData();
      this.drawNodeEvents();
    }
  };

  private _taskJsonData!: any
  @Input()
  set taskJsonData(data: any) {
    if (data) {
      this._taskJsonData = data
      this.buildTaskData();
      this.drawTaskEvents();
    }
  };
  @Output() timelineBrushedEvent = new EventEmitter<[Date, Date]>();

  // private DEFAULT_START_TIME = TIME.DEFAULT_START_TIME
  // private DEFAULT_END_TIME = TIME.DEFAULT_END_TIME
  private DEFAULT_START_TIME;
  private DEFAULT_END_TIME;
  private X_AXIS_HEIGHT = 100;

  private svg: any;
  private taskEventGroup: any;
  private nodeEventGroup: any;
  private xAxis: any;
  private x: any
  private brush: any;
  private width = 0;
  private height = 0;

  private taskEventData!: any;
  private nodeEventData!: any;

  constructor() { }

  ngAfterViewInit(): void {
    // this.createSvg()
  }
  private eventToColor(status) {
    switch (status) {
      // case "pending": return "#D9D9D9";
      case "started": return "#538DF9";
      case "completed": return "#43A047";
      // case "terminated": return "#D32F2F";
      case "failed": return "#D32F2F";
    }
    return "#000"
  }
  private buildNodeData(): void {
    this.nodeEventData = []
    if (this._nodeJsonData) {
      this._nodeJsonData.forEach((d) => {
        switch (d.status) {
          case "terminated":
            this.nodeEventData.push({
              time: new Date(d.end_time),
              event: "terminated"
            })
            break;
        }
        // this.nodeEventData.push({
        //   time: new Date(d.start_time),
        //   event: "started"
        // })
      })
    }
    console.log(this.nodeEventData)
  }
  private buildTaskData(): void {
    this.taskEventData = []
    if (this._taskJsonData) {
      this._taskJsonData.forEach((d) => {
        switch (d.status) {
          case "failed":
            this.taskEventData.push({
              time: new Date(d.end_time),
              event: "failed"
            })
            break;
          // case "completed":
          //   this.taskEventData.push({
          //     time: new Date(d.end_time),
          //     event: "completed"
          //   })
          //   break;
        }
        // this.taskEventData.push({
        //   time: new Date(d.start_time),
        //   event: "started"
        // })
      })
    }
  }

  public createSvg(): void {
    this.height = this.X_AXIS_HEIGHT
    this.width = this.globalTimeline.nativeElement.offsetWidth
    this.svg = d3.select("figure#timeline")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)

    // Create the X-axis band scale
    console.log(this.DEFAULT_START_TIME)
    let xRange = [new Date(this.DEFAULT_START_TIME), new Date(this.DEFAULT_END_TIME)]
    this.x = d3Scale.scaleTime()
      .range([LAYOUT.CHART_MARGIN_LEFT, this.width])
      .domain(xRange)
    this.xAxis = this.svg.append("g")
    this.xAxis
      .attr("transform", "translate(0," + (this.height - this.X_AXIS_HEIGHT) + ")")
      .call(d3.axisBottom(this.x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    this.brush = d3Brush.brushX()
      .extent([[LAYOUT.CHART_MARGIN_LEFT, 0], [this.width, this.X_AXIS_HEIGHT]])
      .on('end', (event) => {
        let xStartTime: Date;
        let xEndTime: Date;

        if (!event.selection) {
          xStartTime = new Date(this.DEFAULT_START_TIME)
          xEndTime = new Date(this.DEFAULT_END_TIME)
        }
        else {
          let dateRange = event.selection.map(this.x.invert)
          xStartTime = dateRange[0]
          xEndTime = dateRange[1]
        }
        this.timelineBrushedEvent.emit([xStartTime, xEndTime])
      })

    this.xAxis.call(this.brush)
  }
  public drawTaskEvents(): void {
    // Task event
    this.taskEventGroup =
      this.svg
        .append("g")
        .selectAll("rect")
        .data(this.taskEventData)

    this.taskEventGroup
      .enter()
      .append("rect")
      .attr("x", (d) => this.x(d.time))
      .attr("y", 30)
      .attr("width", 1)
      .attr("height", 20)
      .attr("fill", (d) => this.eventToColor(d.event))

    this.svg
      .append("g")
      .append("text")
      .text("Task events")
      .attr("x", 60)
      .attr("y", 45)
  }
  public drawNodeEvents(): void {
    this.nodeEventGroup =
      this.svg
        .append("g")
        .selectAll("rect")
        .data(this.nodeEventData)

    this.nodeEventGroup
      .enter()
      .append("rect")
      .attr("x", (d) => this.x(d.time))
      .attr("y", 70)
      .attr("width", 1)
      .attr("height", 20)
      .attr("fill", (d) => this.eventToColor(d.event))

    this.svg
      .append("g")
      .append("text")
      .text("Node events")
      .attr("x", 60)
      .attr("y", 85)

  }
  // brushed(event, d) {

  // }
}
