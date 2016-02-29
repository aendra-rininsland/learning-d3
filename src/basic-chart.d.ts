import * as d3 from 'd3';

export declare class BasicChart {
  constructor(data?: any);
  data: any;
  svg: d3.Selection<SVGElement>;
  chart: d3.Selection<SVGGElement>;
  width: number;
  height: number;
  margin: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }
}
