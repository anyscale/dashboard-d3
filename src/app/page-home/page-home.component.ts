import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import { interpolateYlGn } from 'd3';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { ComponentDetailPanelComponent } from '../component-detail-panel/component-detail-panel.component';
import { SectionJobsComponent } from '../section-jobs/section-jobs.component';
import { SectionNodesComponent } from '../section-nodes/section-nodes.component';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.scss'],
  // directives: [ComponentDetailPanelComponent]
})
export class PageHomeComponent implements AfterViewInit {
  @ViewChild('detailPanel')
  detailPanel!: ComponentDetailPanelComponent;

  @ViewChild('jobSection')
  jobSection!: SectionJobsComponent;

  @ViewChild('nodeSection')
  nodeSection!: SectionNodesComponent;

  public metaJsonData: any;
  public taskJsonData: any;
  public nodeJsonData: any;

  constructor() { }
  ngAfterViewInit(): void {
    d3.json("assets/meta.json").then(data => {
      this.metaJsonData = data;
      d3.json("assets/tasks.json").then(data => {
        this.taskJsonData = data;
      })
      d3.json("assets/nodes.json").then(data => {
        this.nodeJsonData = data;
      })
    })
  }
  onTaskClick(taskID: string) {
    this.detailPanel.openObjectDetail("task", this.taskJsonData.find((obj) => { return obj.id == taskID; }))
  }

  onNodeClick(nodeID: string) {
    this.detailPanel.openObjectDetail("node", this.nodeJsonData.find((obj) => { return obj.id == nodeID; }))
  }
  onTimelineBrush(extent: [Date, Date]) {
    this.jobSection.updateTimeline(extent)
    this.nodeSection.updateTimeline(extent)
  }
}


//   ngOnInit(): void {
//     this.createSvg()
//     d3.json("/assets/nodes.json").then(data => {
//       console.log(data);
//       this.jsonData = data;
//       this.nodeData = this.buildChartData();
//       this.drawBars(this.nodeData);
//     })

//   }

//   public randomPos(min: number, max: number) {
//     return Math.floor(Math.random() * (max - min)) + min;
//   }

//   public createSvg(): void {
//     this.svg = d3.select("figure#lineChart")
//       .append("svg")
//       .attr("width", this.width + (this.margin * 2))
//       .attr("height", this.height + (this.margin * 2))
//       .append("g")
//       .attr("transform", "translate(" + this.margin + "," + this.margin + ")");

//   }
//   private buildChartData(): any[] {

//     console.log('LineChartComponent:buildChartData');
//     console.log(this.jsonData[0].CPU)
//     this.jsonData = this.jsonData[0].CPU
//     let data: any = [];
//     if (this.jsonData != null) {
//       // let value: any = null;

//       // Extract the desired data from the JSON object
//       this.jsonData.forEach((d) => {
//         data.push(
//           {
//             timestamp: new Date(d.timestamp),
//             value: d.value
//           });
//       }
//       );
//     }
//     return data;
//   }
//   private drawBars(data: any[]): void {

//     // Create the X-axis band scale
//     let xRange = [d3.min(this.nodeData, (d) => d.timestamp), d3.max(this.nodeData, (d) => d.timestamp)]
//     const x = d3Scale.scaleTime()
//       .range([0, this.width])
//       .domain(xRange)


//     // Draw the X-axis on the DOM
//     this.svg.append("g")
//       .attr("transform", "translate(0," + this.height + ")")
//       .call(d3.axisBottom(x))
//       .selectAll("text")
//       .attr("transform", "translate(-10,0)rotate(-45)")
//       .style("text-anchor", "end");

//     // Create the Y-axis band scale
//     let yRange = [0, 100]
//     const y = d3.scaleLinear()
//       .domain(yRange)
//       .range([this.height, 0]);

//     // Draw the Y-axis on the DOM
//     this.svg.append("g")
//       .call(d3.axisLeft(y));

//     let line = d3Shape.line()
//       .x((d: any) => x(d.timestamp))
//       .y((d: any) => y(d.value));

//     this.svg.append('path')
//       .datum(this.nodeData)
//       .attr("fill", "none")
//       .attr("stroke", "steelblue")
//       .attr("stroke-width", 1.5)
//       .attr("stroke-linejoin", "round")
//       .attr("stroke-linecap", "round")
//       .attr("d", line);
//   }
// }
