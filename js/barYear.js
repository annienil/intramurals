class BarYear {
 constructor(_config, _data, _colour, _names, _dispatcher) {
    this.config = {
        containerWidth: _config.containerWidth,
        containerHeight: _config.containerHeight,
        layoutPadding: _config.layoutPadding,
        timelineWidth: _config.timelineWidth,
        timelineHeight: _config.timelineHeight,
        barYearWidth: _config.barYearWidth,
        tooltipPadding: 10
    }
    this.leagueColourScale = _colour;
    this.leagueNameScale = _names;
    this.data = _data;
    this.year = '22/23';
    this.leagueFilter = [2,4,3,8,5,6,7,20];
    this.tiersFilter = null;
    this.dispatcher = _dispatcher;

    this.dataPoints = [[2, '22/23', 171], [5, '22/23', 213], [7, '22/23', 263], [3, '22/23', 57], [6, '22/23', 70], [8, '22/23', 62], [4, '22/23', 44], [20, '22/23', 75],
    [4, '21/22', 46], [7, '21/22', 228], [5, '21/22', 168], [6, '21/22', 56], [2, '21/22', 165], [3, '21/22', 18], [8, '21/22', 16], [20, '21/22', 52],
    [2, '19/20', 204], [3, '19/20', 90], [5, '19/20', 136], [7, '19/20', 214], [20, '19/20', 74], [6, '19/20', 43], [8, '19/20', 46], [4, '19/20', 44],
    [2, '18/19', 199], [3, '18/19', 111], [5, '18/19', 147], [7, '18/19', 197], [20, '18/19', 83], [6, '18/19', 43], [8, '18/19', 51], [4, '18/19', 48],
    [4, '17/18', 48], [2, '17/18', 189], [3, '17/18', 108], [5, '17/18', 145], [7, '17/18', 209], [20, '17/18', 79], [6, '17/18', 44], [8, '17/18', 55],
    [4, '16/17', 48], [2, '16/17', 189], [3, '16/17', 108], [5, '16/17', 145], [7, '16/17', 209], [20, '16/17', 79], [6, '16/17', 44], [8, '16/17', 55],
    [2, '15/16', 192], [3, '15/16', 117], [5, '15/16', 119], [7, '15/16', 206], [20, '15/16', 85], [6, '15/16', 66], [8, '15/16', 61], [4, '15/16', 48],
    [2, '14/15', 176], [3, '14/15', 129], [5, '14/15', 139], [7, '14/15', 214], [20, '14/15', 81], [6, '14/15', 58], [8, '14/15', 68], [4, '14/15', 48],
    [2, '13/14', 169], [3, '13/14', 115], [5, '13/14', 142], [7, '13/14', 214], [20, '13/14', 87], [8, '13/14', 75], [4, '13/14', 48], [6, '13/14', 60],
    [2, '12/13', 173], [3, '12/13', 121], [4, '12/13', 52], [5, '12/13', 120], [7, '12/13', 204], [20, '12/13', 64], [6, '12/13', 56], [8, '12/13', 71]
    [2, '20/21', 0], [3, '20/21', 0], [4, '20/21', 0], [5, '20/21', 0], [7, '20/21', 0], [20, '20/21', 0], [6, '20/21', 0], [8, '20/21', 0]];

    this.dataCurrent;

    this.initVis();
}

initVis() {
  let vis = this;

  vis.chartArea = d3.select('#svg').append('g')
    .attr('width', vis.config.barYearWidth)
    .attr('height', vis.config.containerHeight - vis.config.timelineHeight)
    .attr('id', 'barYear')
    .attr('transform', `translate(${vis.config.layoutPadding},${vis.config.layoutPadding + vis.config.timelineHeight + 45})`);
  
  vis.chartAreaBorder = vis.chartArea.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('width', vis.config.timelineWidth)
    .attr('height', vis.config.containerHeight - vis.config.timelineHeight - 60)
    .style('stroke', '#333')
    .style('stroke-opacity', 0.6)
    .style('stroke-width', 1.5)
    .style('fill', 'none');

  vis.darkColourScale = d3.scaleOrdinal()
    .domain([2,3,4,5,6,7,8,20])
    .range(['#ba4a3d', '#d1822a', '#367a6f', '#1d5278', '#56468c', '#3f6b0d', '#302f30', '#a83974']);

  vis.xScale = d3.scaleBand()
    .range([0, vis.config.barYearWidth - 30])
    .paddingInner(0.3)
    .paddingOuter(0.2);

  vis.yScale = d3.scaleLinear()
    .range([210, 0]);

  vis.xAxis = d3.axisBottom(vis.xScale);

  vis.yAxis = d3.axisLeft(vis.yScale)
    .ticks(5)
    .tickSize(-(vis.config.barYearWidth - 30));

  vis.xAxisG = vis.chartArea.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(30,237)`);

  vis.yAxisG = vis.chartArea.append('g')
    .attr('class', 'axis y-axis')
    .attr('transform', 'translate(30, 27)');

  vis.yAxisLabel = vis.yAxisG.append('text')
    .text('Teams Registered')
    .attr('transform', 'translate(85, -5)')
    .style('font-size', 13)
    .style('opacity', 1.0)
    .style('font-weight', 600);

  vis.xAxisG.call(vis.xAxis);

  vis.updateVis(null, []);

}

updateVis(year, leagues) {
    let vis = this;

    if (year == null) {
      vis.year = '22/23';
    } else {
      vis.year = year;
    }
    vis.dataCurrent = vis.dataPoints.filter(d => d[1] == vis.year);

    // vis.dataCurrent = vis.dataPoints;
    if (leagues.length == 0) {
      vis.leagueFilter = [2,4,3,8,5,6,7,20];
      // vis.dataCurrent = vis.dataPoints.filter(d => d[1] == vis.year);
    } else {
      vis.leagueFilter = leagues;
      vis.dataCurrent = vis.dataCurrent.filter(d => leagues.includes(d[0]));
    }
    
    vis.xScale.domain(vis.leagueFilter);
    vis.xAxis.tickFormat(d => vis.leagueNameScale(d));
    vis.xAxisG.call(vis.xAxis);
    vis.xAxisG.select('path.domain').remove();
    vis.yScale.domain([0, d3.max(vis.dataCurrent, d => d[2]) + 10]);
    vis.yAxisG.call(vis.yAxis);
    vis.yAxisG.select('path.domain').remove();

    vis.renderVis();

}

renderVis() {
    let vis = this;

    vis.yearLabel = vis.yAxisG.selectAll('.yearTitle')
      .data(vis.year)
      .join('text')
      .attr('class', 'yearTitle')
      .text('Year: ' + vis.year)
      .attr('x', 460)
      .attr('y', -5)
      .attr('fill', 'black')
      .style('font-size', 15)
      .style('font-weight', 550);

    vis.bars = vis.chartArea.selectAll('.barYearReg')
      .data(vis.dataCurrent)
      .join('rect')
      .attr('class', 'barYearReg')
      .attr('id', d => 'bar' + d[0])
      .attr('x', d => vis.xScale(d[0]) + 30)
      .attr('y', d => vis.yScale(d[2]) + 27)
      .attr('width', vis.xScale.bandwidth())
      .attr('height', d => 210 - vis.yScale(d[2]))
      .attr('fill', d=> vis.leagueColourScale(d[0]))
      .on('mouseover', (event, d) => {
        d3.select('#bar' + d[0]).style('stroke', vis.darkColourScale(d[0]))
          .classed('bar-hovered', true);
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`
          <div class="tooltip-title">${vis.leagueNameScale(d[0])}</div>
           <div class="tooltip">${d[2]} teams registered in ${d[1]}</div>
         `);
      })
      .on('mouseleave', (event, d) => {
        d3.select('#bar' + d[0]).classed('bar-hovered', false);
        d3.select('#tooltip').style('display', 'none');
      })
      .on('click', (event, d) => {
        if (vis.tiersFilter == null) {
          d3.selectAll('#bar' +d[0]).attr('fill', vis.darkColourScale(d[0]));
          vis.tiersFilter = d[0];
        } else if (vis.tiersFilter == d[0]){
          d3.selectAll('#bar' +d[0]).attr('fill', vis.leagueColourScale(d[0]));
          vis.tiersFilter = null;
        } else {
          d3.selectAll('#bar' +d[0]).attr('fill', vis.darkColourScale(d[0]));
          d3.selectAll('#bar' + vis.tiersFilter).attr('fill', vis.leagueColourScale(vis.tiersFilter));
          vis.tiersFilter = d[0];
        }
        vis.dispatcher.call('filterTierLeague', event, vis.tiersFilter);
      });

}
}