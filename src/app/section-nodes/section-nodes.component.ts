import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import { interpolateYlGn } from 'd3';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { COLOR, LAYOUT } from '../consts';

@Component({
  selector: 'app-section-nodes',
  templateUrl: './section-nodes.component.html',
  styleUrls: ['./section-nodes.component.scss']
})
export class SectionNodesComponent implements AfterViewInit {

  @ViewChild('nodeStreamChart')
  nodeStreamChart!: ElementRef;

  private _metaJsonData!: any
  @Input()
  set metaJsonData(data: any) {
    if (data) {
      this.DEFAULT_START_TIME = data.start_time
      this.DEFAULT_END_TIME = data.end_time
      this.createSvg()
    }
  }

  @Input()
  set nodeJsonData(data: any) {
    if (data) {
      this.jsonData = data;
      this.createSvg()
      this.buildChartData();
      this.drawNodeStream();
    }
  };
  @Output() nodeClickEvent = new EventEmitter<string>();
  // private yellow = interpolateYlGn(0.5);

  private DEFAULT_START_TIME
  private DEFAULT_END_TIME
  private NODE_STREAM_BAR_HEIGHT = [8, 48]
  private NODE_STREAM_BAR_VERTICAL_MARGIN = [2, 8]
  private X_AXIS_HEIGHT = 100;

  private zoomLevel = 0;

  private svg: any;
  private xAxis: any;
  private canvas: any;
  private brush: any;
  private width = 0;
  private height = 0;
  private x: any;
  private y: any;
  private xStartTime!: any;
  private xEndTime!: any;

  public nodeData: any[] = [];
  public jsonData: any;
  // public overallCpuUtilizations = {}
  // public overallGpuUtilizations = {}

  constructor() { }
  ngAfterViewInit(): void {
  }

  private nodeStatusToFgColor(status) {
    switch (status) {
      case "pending": return COLOR.GREY_FG;
      case "active": return COLOR.BLUE_FG;
      case "terminated": return COLOR.GREEN_FG;
      case "failed": return COLOR.RED_FG;
    }
    return "#000"
  }

  private nodeStatusToBgColor(status) {
    switch (status) {
      case "pending": return COLOR.GREY_BG;
      case "active": return COLOR.BLUE_BG;
      case "terminated": return COLOR.GREEN_BG;
      case "failed": return COLOR.RED_BG;
    }
    return "#000"
  }
  public createSvg(): void {
    this.svg = d3.select("figure#nodeStreamChart")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
    this.xAxis = this.svg.append("g")
    this.canvas = this.svg.append("g")

  }
  private buildChartData() {
    // Transform the raw JSON data for D3
    this.nodeData = []
    if (this.jsonData != null) {
      this.jsonData.forEach((d) => {
        let cpu: any[] = []
        let gpu: any[] = []
        d.overall_CPU_utilizations.forEach((u) => {
          cpu.push({
            time: new Date(u.time),
            value: u.value
          })
        })
        this.nodeData.push(
          {
            id: d.id,
            ip: d.ip,
            status: d.status,
            nodeType: d.node_type_name,
            startTime: new Date(d.start_time),
            endTime: new Date(d.end_time != null ? d.end_time : this.DEFAULT_END_TIME),
            overallCpuUtilizations: cpu,
            overallGpuUtilizations: d.overall_GPU_utilizations
          });
      }
      );
      this.xStartTime = new Date(this.DEFAULT_START_TIME)
      this.xEndTime = new Date(this.DEFAULT_END_TIME)
    }

    // Sort by node start time
    this.nodeData.sort((x, y) => d3.descending(x.startTime, y.startTime))
  }
  public updateTimeline(extent: [Date, Date]) {
    this.xStartTime = extent[0]
    this.xEndTime = extent[1]

    this.drawNodeStream()
  }
  private drawNodeStream(): void {
    let xRange = [this.xStartTime, this.xEndTime]

    // Create a g element to contain each node rect + utilization line pair
    let nodeGroups = this.canvas.selectAll("g").data(this.nodeData
      .filter((d) => {
        return ((d.startTime < this.xEndTime) && (d.endTime > this.xStartTime))
      })
    )

    let bar_height = this.NODE_STREAM_BAR_HEIGHT[this.zoomLevel]
    let bar_margin = this.NODE_STREAM_BAR_VERTICAL_MARGIN[this.zoomLevel]

    this.height = nodeGroups._enter[0].length * (bar_height + bar_margin) + this.X_AXIS_HEIGHT
    this.width = this.nodeStreamChart.nativeElement.offsetWidth

    // Update the canvas size based on the bar sizes
    this.svg
      .attr("height", this.height)
      .attr("width", this.width)

    // Create the X-axis band scale
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

    // Create the Y-axis band scale for the node rectangles
    let yRange = [0, nodeGroups._enter[0].length]
    const y = d3.scaleLinear()
      .domain(yRange)
      .range([this.height - bar_height - bar_margin - this.X_AXIS_HEIGHT, 0]);

    // Create the Y-axis band scale for the node utilization lines inside each node rectangle 
    const xUtilization = d3Scale.scaleTime()
      .range([LAYOUT.CHART_MARGIN_LEFT, this.width])
      .domain(xRange)
    const yUtilization = d3.scaleLinear()
      .range([bar_height, 0])
      .domain([0, 100])


    // Function to generate the utilization lines
    let lineGen = d3.line()
      .x((d: any) => xUtilization(d.time))
      .y((d: any) => yUtilization(d.value))


    // update 
    nodeGroups
      // update the position of the group
      .attr("transform", (d, i) => "translate(0, " + y(i) + ")")
      // update the node rects
      .select("rect")
      .attr("x", (d) => this.x(d.startTime))
      .attr("width", (d) => (this.x(d.endTime) - this.x(d.startTime)))
      .attr("height", bar_height)
      .attr("id", (d) => d.id)
      .attr("fill", (d) => this.nodeStatusToBgColor(d.status))
      .attr("stroke", (d) => this.nodeStatusToFgColor(d.status))
      .attr("rx", 4)
      .on('mouseover', function () {
        console.log('over')
      })
      .on('click', this.click.bind(this))

    nodeGroups
      // update the utilization lines
      .select("path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      // only draw the utlization lines when the node rect is tall enough
      .attr("d", (d) => { if (this.zoomLevel >= 1) return lineGen(d.overallCpuUtilizations); else return null })

    nodeGroups
      // update the node text
      .select("text")
      .text((d) => { if (this.zoomLevel >= 1) return d.ip; else return null })
      .attr("x", (d) => this.x(d.startTime) - 120)
      .attr("y", this.NODE_STREAM_BAR_HEIGHT[this.zoomLevel] / 2)
    // .attr("y", (d, i) => y(i) + (this.NODE_STREAM_BAR_HEIGHT[this.zoomLevel] + this.NODE_STREAM_BAR_VERTICAL_MARGIN[this.zoomLevel]) / 2)

    // enter
    let newNodeGroup =
      nodeGroups
        .enter()
        .append("g")
        .attr("transform", (d, i) => "translate(0, " + y(i) + ")")

    newNodeGroup
      .append("rect")
      .attr("x", (d) => this.x(d.startTime))
      .attr("width", (d) => (this.x(d.endTime) - this.x(d.startTime)))
      .attr("height", bar_height)
      .attr("id", (d) => d.id)
      .attr("fill", (d) => this.nodeStatusToBgColor(d.status))
      .attr("stroke", (d) => this.nodeStatusToFgColor(d.status))
      .attr("rx", 4)
      .on('mouseover', function () {
      })
      .on('click', this.click.bind(this))
      .attr("start", (d) => d.startTime)

    newNodeGroup
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", (d) => { if (this.zoomLevel >= 1) return lineGen(d.overallCpuUtilizations); else return null })

    newNodeGroup
      .append("text")
      .text((d) => { if (this.zoomLevel >= 1) return d.ip; else return null })
      .attr("x", (d) => this.x(d.startTime) - 120)
      .attr("y", this.NODE_STREAM_BAR_HEIGHT[this.zoomLevel] / 2)
    // .attr("y", (d, i) => y(i) + (this.NODE_STREAM_BAR_HEIGHT[this.zoomLevel] + this.NODE_STREAM_BAR_VERTICAL_MARGIN[this.zoomLevel]) / 2)

    // exit
    nodeGroups
      .exit()
      .remove()
    nodeGroups
      .selectAll("rect")
      .exit()
      .remove()
    // if (this.zoomLevel >= 1) {
    //   nodeGroups
    //     .append("text")
    //     .text((d) => d.ip)
    //     .attr("x", (d) => x(d.startTime) - 100)
    //     .attr("y", (d, i) => y(i) + (this.NODE_STREAM_BAR_HEIGHT[this.zoomLevel] + this.NODE_STREAM_BAR_VERTICAL_MARGIN[this.zoomLevel]) / 2)

    // }
  }
  click(d) {
    console.log(d.target.id)
    this.nodeClickEvent.emit(d.target.id)
  }
  zoomIn() {
    this.zoomLevel = Math.min(this.NODE_STREAM_BAR_HEIGHT.length - 1, this.zoomLevel + 1)
    this.drawNodeStream()
  }
  zoomOut() {
    this.zoomLevel = Math.max(0, this.zoomLevel - 1)
    this.drawNodeStream()
  }
}
