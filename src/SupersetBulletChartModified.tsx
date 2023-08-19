/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * 'License'); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useEffect } from "react";
import * as d3 from "d3";
import { SupersetBulletChartModifiedProps } from "./types";

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

// const Styles = styled.div<SupersetBulletChartModifiedStylesProps>``;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function SupersetBulletChartModified(
  props: SupersetBulletChartModifiedProps
) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  const { data, height, width } = props;
  const gpId = `graphics${(Math.floor((Math.random() * 100) + 1))}`;
  // const rootElem = createRef<HTMLDivElement>();
  // const svgRef = createRef<SVGSVGElement>();

  // Often, you just want to access the DOM and do whatever you want.
  // Here, you can do that with createRef, and the useEffect hook.
  useEffect(() => {
    d3.select("#graphic").selectAll("svg").remove();
    render();
  }, [props]);

  const customColors = [
    '#DF6766',
    '#1DA486',
    '#FF6633',
    '#FFB399',
    '#FF33FF',
    '#FFFF99'
  ];

  const uniqueBedTypes: any = Array.from(
    new Set(data.map((d: any) => d.bed_type))
  );

  const groupData = (data: any, total: any) => {
    let cumulative = 0;
    const newData = data.filter((d: any) => d.bed_type === uniqueBedTypes[0]);
    const returnData = newData
      .map((d: any) => {
        cumulative += d.counts;
        return {
          counts: d.counts,
          cumulative,
          bed_type: d.bed_type,
          status: d.status,
          percent: ((d.counts / total) * 100).toFixed(2),
        };
      })
      .filter((d: any) => d.counts > 0);
    return returnData;
  };

  const drawHorizontalStackBar = () => {
    const config: any = {
      f: d3.format(".1f"),
      margin: { top: 20, right: 10, bottom: 20, left: 10 },
      barHeight: 10,
    };
    const { margin, barHeight } = config;
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const halfBarHeight = barHeight;

    // total value
    const total = d3.sum(data, (d: any) => d.counts);
    let groupedData = groupData(data, total);
    const sum = groupedData.reduce(
      (sum: any, value: any) => sum + parseFloat(value.percent),
      0
    );

    let remainPercentage = 0;
    if (sum < 100) {
      remainPercentage = 100 - sum;
      const percentagePerItem = remainPercentage / groupedData.length;
      groupedData = groupedData.map((d: any) =>({
          counts: d.counts,
          cumulative: d.cumulative,
          bed_type: d.bed_type,
          status: d.status,
          percent: parseFloat(d.percent) + percentagePerItem,
        })
      );
    }

    // set up scales for horizontal placement
    // d3.select('svg').remove();
    const selection = d3
      .select(`#${gpId}`)
      .append("svg")
      // .attr("id")
      .attr("width", w)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate( ${margin.left}, ${margin.top})`);

    // const xScale = d3Scale.scaleLinear().domain([0, total]).range([0, w]);
    // const max: any = d3.max(_data, (d: any) => d.counts)!;
    // const xScale = d3Scale.scaleLinear().domain([0, max]).range([0, width]);

    // stack rect for each data value
    console.log('groupedData', groupedData);
    // d3.selectAll("rect").remove();
    selection
      .selectAll("rect")
      .data(groupedData)
      .enter()
      .append("rect")
      .attr("class", "rect-stacked")
      .attr("x", (d: any, i: number) => i === 0 ? 0 : `${groupedData[i -1 ].percent}%`)
      .attr("y", h / 2 - halfBarHeight)
      .attr("rx", (d: any, i: number) => (i === 0 ? 5 : 0))
      .attr("ry", (d: any, i: number) => (i === groupedData.length - 1 ? 5 : 0))
      .attr("height", barHeight)
      .attr('width', (d: any, i: number) => `${d.percent}%`)
      .style("fill", (d, i) => customColors[i]);

    const legendsData = prepareLegendData(groupedData);
    drawLegends(selection, legendsData[0], height);
  };

  // generate legend data
  const prepareLegendData = (data: any) => {
    const legendsData: any = [];
    const newData = data.filter((d: any) => (d.bed_type === uniqueBedTypes[0]));
    uniqueBedTypes.forEach((element: any) => {
      legendsData.push({
        name: element,
        data: newData,
      });
    });

    return legendsData;
  };

  const drawLegends = (selection: any, le: any, h: number) => {
    // d3.selectAll(".legend-title").remove();
    selection
      .append("text")
      .attr("class", "legend-title")
      .text(uniqueBedTypes[0])
      .attr("x", 0)
      .attr("y", h / 2 - 50)
      .attr("text-anchor", "start")
      .attr("font-size", 15)
      .attr("font-weight", "500")
      .attr("fill", "#000000");

    const sum = le.data.reduce(
      (sum: any, value: any) => sum + parseFloat(value.counts),
      0
    );
    console.log('sum', sum);
    // d3.selectAll(".legend-title-count").remove();
    selection
      .append("text")
      .attr("class", "legend-title-count")
      .text(sum)
      .attr("x", width - 45)
      .attr("y", h / 2 - 50)
      .attr("text-anchor", "middle")
      .attr("font-size", 13)
      .attr("font-weight", "500")
      .attr("fill", "#000000");

    // legends shape
    const size = 25;
    // d3.selectAll("circle").remove();
    selection
      .selectAll("circle")
      .data(le.data)
      .enter()
      .append("circle")
      .style("fill", (d: any, i: number) => customColors[i])
      .attr("r", 5)
      .attr("cx", 5)
      .attr("cy", (d: any, i: number) => h / 2 + i * size);

    // legends label
    // d3.selectAll(".legend-labels").remove();
    selection
      .selectAll(".legend-labels")
      .data(le.data)
      .enter()
      .append("text")
      .attr("class", "legend-labels")
      .attr("x", 25)
      .attr("y", (d: any, i: number) => h / 2 + i * size)
      .style("fill", "#000")
      .text((d: any) => d.status)
      .attr("text-anchor", "left")
      .attr("font-size", 12)
      .attr("font-weight", "500")
      .style("alignment-baseline", "middle");

    // count labels
    // d3.selectAll(".legend-labels-count").remove();
    selection
      .selectAll(".legend-labels-count")
      .data(le.data)
      .enter()
      .append("text")
      .attr("class", "legend-labels-count")
      .attr("x", width - 55)
      .attr("y", (d: any, i: number) => h / 2 + i * size)
      .style("fill", "#000")
      .text((d: any) => d.counts)
      .attr("text-anchor", "left")
      .attr("font-size", 12)
      .attr("font-weight", "500")
      .style("alignment-baseline", "middle");
  };

  const render = () => {
    drawHorizontalStackBar();
  };

  return (
    <div>
      <div id={gpId}/>
    </div>
  );
}
