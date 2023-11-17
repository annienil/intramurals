class Timeline {
  constructor(_config, _data, _colour, _dispatcher) {
    this.config = {
        containerWidth: _config.containerWidth,
        containerHeight: _config.containerHeight,
        layoutPadding: _config.layoutPadding,
        timelineWidth: _config.timelineWidth,
        timelineHeight: _config.timelineHeight,
        barYearWidth: _config.barYearWidth,
        legendWidth: 210,
        legendRadius: 7,
        tooltipPadding: 10
    }

    this.leagueColourScale = _colour;
    this.data = _data;
    this.dispatcher = _dispatcher;
    

    // this.iDs = [2,3,4,5,6,7,8,20];

    this.data22 = d3.rollups(this.data.filter(d => d.year == '22/23'), v => d3.sum(v, d => d.numTeams), d => d.activityID, d => d.year);

    this.dataPoints = [[2, '22/23', 171], [5, '22/23', 213], [7, '22/23', 263], [3, '22/23', 57], [6, '22/23', 70], [8, '22/23', 62], [4, '22/23', 44], [20, '22/23', 75],
        [4, '21/22', 46], [7, '21/22', 228], [5, '21/22', 168], [6, '21/22', 56], [2, '21/22', 165], [3, '21/22', 18], [8, '21/22', 16], [20, '21/22', 52],
        [2, '19/20', 204], [3, '19/20', 90], [5, '19/20', 136], [7, '19/20', 214], [20, '19/20', 74], [6, '19/20', 43], [8, '19/20', 46], [4, '19/20', 44],
        [2, '18/19', 199], [3, '18/19', 111], [5, '18/19', 147], [7, '18/19', 197], [20, '18/19', 83], [6, '18/19', 43], [8, '18/19', 51], [4, '18/19', 48],
        [4, '17/18', 48], [2, '17/18', 189], [3, '17/18', 108], [5, '17/18', 145], [7, '17/18', 209], [20, '17/18', 79], [6, '17/18', 44], [8, '17/18', 55],
        [4, '16/17', 48], [2, '16/17', 189], [3, '16/17', 108], [5, '16/17', 145], [7, '16/17', 209], [20, '16/17', 79], [6, '16/17', 44], [8, '16/17', 55],
        [2, '15/16', 192], [3, '15/16', 117], [5, '15/16', 119], [7, '15/16', 206], [20, '15/16', 85], [6, '15/16', 66], [8, '15/16', 61], [4, '15/16', 48],
        [2, '14/15', 176], [3, '14/15', 129], [5, '14/15', 139], [7, '14/15', 214], [20, '14/15', 81], [6, '14/15', 58], [8, '14/15', 68], [4, '14/15', 48],
        [2, '13/14', 169], [3, '13/14', 115], [5, '13/14', 142], [7, '13/14', 214], [20, '13/14', 87], [8, '13/14', 75], [4, '13/14', 48], [6, '13/14', 60],
        [2, '12/13', 173], [3, '12/13', 121], [4, '12/13', 52], [5, '12/13', 120], [7, '12/13', 204], [20, '12/13', 64], [6, '12/13', 56], [8, '12/13', 71]];

    this.dataPaths = d3.groups(this.dataPoints, d => d[0]);

    this.leagueFilter = [];

    this.dataPathsCurrent = this.dataPaths;
    this.dataPointsCurrent = this.dataPoints;
    this.year = null; 

    this.initVis();
}

 initVis() {
    let vis = this;

    vis.chartArea = d3.select('#svg').append('g')
      .attr('width', vis.config.containerWidth - vis.config.layoutPadding)
      .attr('height', vis.config.timelineHeight)
      .attr('id', 'timeline')
      .attr('transform', `translate(${vis.config.layoutPadding},${vis.config.layoutPadding + 10})`);
    
    vis.fullNameScale = d3.scaleOrdinal()
      .domain([2,3,4,5,6,7,8,20])
      .range(['Nitobe Basketball League', 'SRC Futsal League', 'Todd Ice Hockey League', 'Handley Cup Soccer League', 'Ultimate League', 'Cross Volleyball League', 'Point Grey Cup Flag Football League', 'Dodgeball League']);

    vis.xScale = d3.scaleBand()
      .domain(['12/13', '13/14', '14/15', '15/16', '16/17', '17/18', '18/19', '19/20', '20/21', '21/22', '22/23'])
      .range([0, vis.config.containerWidth - vis.config.legendWidth - 60])
      .paddingInner(0.2)
      .paddingOuter(0.2);

    vis.yScale = d3.scaleLinear()
      .domain([0, 280])
      .range([vis.config.timelineHeight - vis.config.layoutPadding, 0]);

    vis.xAxis = d3.axisBottom(vis.xScale);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickSize(-(vis.config.containerWidth - vis.config.legendWidth - 60));

    vis.xAxisG = vis.chartArea.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(25,${vis.config.timelineHeight - vis.config.layoutPadding})`);

    vis.yAxisG = vis.chartArea.append('g')
      .attr('class', 'axis y-axis')
      .attr('transform', 'translate(25,0)');

    vis.yAxisLabel = vis.yAxisG.append('text')
      .text('Teams Registered')
      .attr('transform', 'translate(85, -10)')
      .style('font-size', 13)
      .style('opacity', 1.0)
      .style('font-weight', 600);

    vis.xAxisG.call(vis.xAxis);
    vis.xAxisG.select('path.domain').remove();
    vis.xAxisG.selectAll('g.tick').remove();

    vis.yAxisG.call(vis.yAxis);
    vis.yAxisG.selectAll('path.domain').remove();
    

    vis.renderLegend();
    vis.updateVis();

}

 updateVis() {
    let vis = this;


    if (vis.leagueFilter.length == 0) {
        vis.dataPointsCurrent = vis.dataPoints;
        vis.dataPathsCurrent = vis.dataPaths;
    } else {
       vis.dataPathsCurrent = vis.dataPaths.filter(d => vis.leagueFilter.includes(d[0]));
       vis.dataPointsCurrent = vis.dataPoints.filter(d => vis.leagueFilter.includes(d[0]));
    }

    vis.renderVis();
        
}

 renderVis() {
    let vis = this;

    vis.axisLabels = vis.chartArea.selectAll('.axisLabel')
      .data(['12/13', '13/14', '14/15', '15/16', '16/17', '17/18', '18/19', '19/20', '20/21', '21/22', '22/23'])
      .join('text')
      .attr('class', 'axisLabel')
      .attr('id', d => 'year' + d.slice(0,2))
      .attr('x', d => vis.xScale(d) + 36)
      .attr('y', vis.config.timelineHeight + 5)
      .classed('axisLabel-selected', d => {
        if (vis.year !== null) {
            return false;
        } else if (d == '22/23') {
            return true;
        } else {
            return false;
        }
      })
      .text(d => d)
      .on('click', (event, d) => {
        if (vis.year == null) {
            vis.year = d;
            d3.select('#year' + d.slice(0,2)).classed('axisLabel-selected', true);
            d3.select('#year22').classed('axisLabel-selected', false);
        } else if (vis.year == d) {
            vis.year = null;
            d3.select('#year' + d.slice(0,2)).classed('axisLabel-selected', false);
            d3.select('#year22').classed('axisLabel-selected', true);
        } else {
            d3.select('#year' + d.slice(0,2)).classed('axisLabel-selected', true);
            d3.select('#year' + vis.year.slice(0,2)).classed('axisLabel-selected', false);
            vis.year = d;
        }
        vis.dispatcher.call('filterBarYear', event, [vis.year, vis.leagueFilter]);
      });


    vis.paths = vis.chartArea.selectAll('.path')
      .data(vis.dataPathsCurrent)
      .join('path')
      .attr('class', 'path')
      .attr('d', d => d3.line()([[vis.xScale(d[1][9][1]), vis.yScale(d[1][9][2])], [vis.xScale(d[1][8][1]), vis.yScale(d[1][8][2])], [vis.xScale(d[1][7][1]), vis.yScale(d[1][7][2])], [vis.xScale(d[1][6][1]), vis.yScale(d[1][6][2])], [vis.xScale(d[1][5][1]), vis.yScale(d[1][5][2])], [vis.xScale(d[1][4][1]), vis.yScale(d[1][4][2])], [vis.xScale(d[1][3][1]), vis.yScale(d[1][3][2])], [vis.xScale(d[1][2][1]), vis.yScale(d[1][2][2])], [vis.xScale('20/21'), vis.yScale(0)], [vis.xScale(d[1][1][1]), vis.yScale(d[1][1][2])], [vis.xScale(d[1][0][1]), vis.yScale(d[1][0][2])]]))
      .attr('stroke', d => vis.leagueColourScale(d[0]))
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')
      .attr('transform', 'translate(50, 0)');

    vis.points = vis.chartArea.selectAll('.point')
      .data(vis.dataPointsCurrent)
      .join('circle')
      .attr('class', 'point')
      .attr('id', d => 'point' + d[0] + d[1].slice(0,2))
      .attr('fill', d => vis.leagueColourScale(d[0]))
      .attr('cx', d => vis.xScale(d[1]) + 50)
      .attr('cy', d => vis.yScale(d[2]))
      .attr('r', 3)
      .style('stroke', '#333')
      .style('stroke-width', 0.2)
      .on('mouseover', (event, d) => {
        d3.selectAll("#point" + d[0] + d[1].slice(0,2)).style('stroke-width', 1.5);
        d3.select('#tooltip')
        .style('display', 'block')
        .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
       .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
       .html(`
         <div class="tooltip-title">${vis.fullNameScale(d[0])}</div>
         <div class="tooltip">${d[2]} teams registered in ${d[1]}</div>
       `);
      })
      .on('mouseleave', (event, d) => {
        d3.selectAll("#point" + d[0] + d[1].slice(0,2)).style('stroke-width', 0.2);
        d3.select('#tooltip').style('display', 'none');
      });

    vis.covidPoint = vis.chartArea.append('circle')
        .attr('class', 'covidPoint')
        .attr('fill', 'white')
        .attr('cx', vis.xScale('20/21') + 50)
        .attr('cy', vis.yScale(0))
        .attr('r', 3)
        .style('stroke', '#333')
        .style('stroke-width', 0.4)
        .on('mouseover', (event, d) => {
            d3.selectAll(".covidPoint").style('stroke-width', 1.5);
            d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
           .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
           .html(`
             <div class="tooltip-title">Covid-19 Pandemic</div>
             <div class="tooltip">In-person intramurals programs halted.</div>
           `);
          })
          .on('mouseleave', (event, d) => {
            d3.selectAll(".covidPoint").style('stroke-width', 0.4);
            d3.select('#tooltip').style('display', 'none');
          });

    // vis.magnifying = vis.chartArea.selectAll('.magnifying')
    //   .data([vis.year])
    //   .join('rect')
    //   .attr('class', 'magnifying')
    //   .attr('x', d => {
    //     if (d == null) {
    //         return vis.xScale('22/23');
    //     } else {
    //         return vis.xScale(d);
    //     }})
    //   .attr('y', 250)
    //   .attr('height', 200)
    //   .attr('width', vis.xScale.bandwidth)
    //   .attr('fill', none);
}

 renderLegend() {
    let vis = this;

    vis.legendPoint = vis.chartArea.selectAll('.legendElement')
      .data([2, 3, 4, 5, 6, 7, 8, 20])
      .join('circle')
      .attr('class', 'legendElement')
      .attr('fill', d=> vis.leagueColourScale(d))
      .attr('cx', vis.config.containerWidth - vis.config.legendWidth - vis.config.layoutPadding)
      .attr('cy', (d, i) => i * 20 + 50)
      .attr('r', vis.config.legendRadius)
      .style('stroke', '#333')
      .style('stroke-width', 0.5);

      vis.legendTitle = vis.chartArea.append('text')
      .attr('class', 'legendTitle')
      .attr('id', d=>d)
      .text('Leagues')
      .attr('x', vis.config.containerWidth - vis.config.legendWidth - vis.config.layoutPadding - 5)
      .attr('y', 35)
      .attr('fill', 'black');

    // create legend labels and add interactivity
    vis.legendLabel = vis.chartArea.selectAll('.legendLabel')
      .data([2, 3, 4, 5, 6, 7, 8, 20])
      .join('text')
      .attr('class', 'legendLabel')
      .attr('id', d=> 'league' + d)
      .text(d => vis.fullNameScale(d))
      .attr('x', vis.config.containerWidth - vis.config.legendWidth)
      .attr('y', (d, i) => i * 20 + 55)
      .attr('fill', 'black')
      .on('click', (event, d) => {
        if (vis.leagueFilter.includes(d)) {
            d3.select('#league' + d).classed('legendLabelSelected', false);
            let temp = [];
            vis.leagueFilter.forEach(v => {
                if (v !== d) {
                    temp.push(v);
                }
            });
            vis.leagueFilter = temp;
        } else {
            vis.leagueFilter.push(d);
            d3.select('#league' + d).classed('legendLabelSelected', true);
        }
        vis.updateVis();
        vis.dispatcher.call('filterBarYear', event, [this.year, vis.leagueFilter]);

      });
}
}