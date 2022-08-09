import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Input, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import { interpolateYlGn } from 'd3';
import * as d3Brush from 'd3-brush'
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { COLOR, LAYOUT} from '../consts';

@Component({
  selector: 'app-section-jobs',
  templateUrl: './section-jobs.component.html',
  styleUrls: ['./section-jobs.component.scss']
})
export class SectionJobsComponent implements AfterViewInit {

  @ViewChild('taskStreamChart')
  taskStreamChart!: ElementRef;

  private _metaJsonData!: any
  @Input()
  set metaJsonData(data: any) {
    if (data) {
      this.DEFAULT_START_TIME = data.start_time
      this.DEFAULT_END_TIME = data.end_time
    }
  }

  @Input()
  set taskJsonData(data: any) {
    if (data) {
      this.jsonData = data;
      this.height = (this.jsonData.length + 1) * (this.TASK_STREAM_BAR_HEIGHT[this.zoomLevel] + this.TASK_STREAM_BAR_VERTICAL_MARGIN[this.zoomLevel]) + this.X_AXIS_HEIGHT// - (this.margin * 2);
      this.width = this.taskStreamChart.nativeElement.offsetWidth
      this.createSvg()
      this.buildChartData();
      this.drawTaskStream();
    }
  };

  @Output() taskClickEvent = new EventEmitter<string>();

  // UI related variables
  public showPendingJobs = true;
  public showRunningJobs = true;
  public showCompletedJobs = true;
  public showFailedJobs = true;
  public zoomLevel = 1;

  private DEFAULT_START_TIME;
  private DEFAULT_END_TIME;

  private TASK_STREAM_BAR_HEIGHT = [2, 4]
  private TASK_STREAM_BAR_VERTICAL_MARGIN = [1, 1]
  private X_AXIS_HEIGHT = 100;

  private svg: any;
  private xAxis: any;
  private rects: any;
  private brush: any;
  private width = 0;
  private height = 0;
  private x: any;
  private y: any;
  private xStartTime!: any;
  private xEndTime!: any;

  public taskData: any[] = [];
  public jsonData: any;

  constructor() { }

  ngAfterViewInit(): void {
  }

  private taskStatusToColor(status) {
    switch (status) {
      case "pending": return "#D9D9D9";
      case "running": return "#538DF9";
      case "completed": return "#43A047";
      case "failed": return "#D32F2F";
    }
    return "#000"
  }

  public createSvg(): void {
    this.svg = d3.select("figure#taskStreamChart")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
    this.xAxis = this.svg.append("g")
    this.rects = this.svg.append("g")
    // this.brush = d3Brush.brushX().extent([[LAYOUT.CHART_MARGIN_LEFT, 0], [this.width, this.X_AXIS_HEIGHT]]).on('brush', this.brushed);

  }
  public buildChartData(): void {
    this.taskData = []
    if (this.jsonData != null) {
      this.jsonData.forEach((d) => {
        this.taskData.push(
          {
            id: d.id,
            status: d.status,
            startTime: new Date(d.creation_time),
            endTime: new Date(d.end_time != null ? d.end_time : this.DEFAULT_END_TIME),
          });
      }
      );
    }
    this.taskData.sort((x, y) => d3.descending(x.startTime, y.startTime))
    this.xStartTime = new Date(this.DEFAULT_START_TIME)
    this.xEndTime = new Date(this.DEFAULT_END_TIME)
  }
  public updateTimeline(extent: [Date, Date]) {
    this.xStartTime = extent[0]
    this.xEndTime = extent[1]

    this.drawTaskStream()
  }
  private drawTaskStream(): void {

    let xRange = [this.xStartTime, this.xEndTime]

    let rects = this.rects.selectAll("rect").data(this.taskData.filter((d) => {
      return (((d.status == "failed" && this.showFailedJobs) ||
        (d.status == "running" && this.showRunningJobs) ||
        (d.status == "completed" && this.showCompletedJobs) ||
        (d.status == "pending" && this.showPendingJobs)
      )) &&
        ((d.startTime < this.xEndTime) && (d.endTime > this.xStartTime))
    }))

    this.height = this.X_AXIS_HEIGHT + (this.TASK_STREAM_BAR_HEIGHT[this.zoomLevel] + this.TASK_STREAM_BAR_VERTICAL_MARGIN[this.zoomLevel]) * rects._enter[0].length
    this.width = this.taskStreamChart.nativeElement.offsetWidth
    this.svg
      .attr("height", this.height)
      .attr("width", this.width)

    // Create the X-axis band scale
    // let xRange = [new Date(this.DEFAULT_START_TIME), new Date(this.DEFAULT_END_TIME)]
    this.x = d3Scale.scaleTime()
      .range([LAYOUT.CHART_MARGIN_LEFT, this.width])
      .domain(xRange)

    // Draw the X-axis on the DOM
    this.xAxis
      .attr("transform", "translate(0," + (this.height - this.X_AXIS_HEIGHT) + ")")
      .call(d3.axisBottom(this.x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale
    let yRange = [0, rects._enter[0].length]
    this.y = d3.scaleLinear()
      .domain(yRange)
      .range([this.height - this.X_AXIS_HEIGHT - (this.TASK_STREAM_BAR_HEIGHT[this.zoomLevel] + this.TASK_STREAM_BAR_VERTICAL_MARGIN[this.zoomLevel]), 0]);

    // update
    rects
      .attr("x", (d) => this.x(d.startTime))
      .attr("y", (d, i) => this.y(i))
      .attr("width", (d) => (this.x(d.endTime) - this.x(d.startTime)))
      .attr("height", this.TASK_STREAM_BAR_HEIGHT[this.zoomLevel])
      .attr("id", (d) => d.id)
      .attr("fill", (d) => this.taskStatusToColor(d.status))
      .on("click", this.click.bind(this))

    // enter
    rects
      .enter()
      .append("rect")
      .attr("x", (d) => this.x(d.startTime))
      .attr("y", (d, i) => this.y(i))
      .attr("width", (d) => (this.x(d.endTime) - this.x(d.startTime)))
      .attr("height", this.TASK_STREAM_BAR_HEIGHT[this.zoomLevel])
      .attr("id", (d) => d.id)
      .attr("fill", (d) => this.taskStatusToColor(d.status))
      .on("click", this.click.bind(this))

    // remove
    rects
      .exit()
      .remove()

  }
  click(d) {
    // console.log(d.target.id)
    this.taskClickEvent.emit(d.target.id)
  }
  repaint() {
    this.drawTaskStream()
  }
  zoomIn() {
    this.zoomLevel = Math.min(this.TASK_STREAM_BAR_HEIGHT.length - 1, this.zoomLevel + 1)
    this.drawTaskStream()
  }
  zoomOut() {
    this.zoomLevel = Math.max(0, this.zoomLevel - 1)
    this.drawTaskStream()
  }
}