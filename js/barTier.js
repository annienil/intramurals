class BarTier {
 constructor(_config, _data, _colour, _names, _dispatcher) {
    this.config = {
        containerWidth: _config.containerWidth,
        containerHeight: _config.containerHeight,
        layoutPadding: _config.layoutPadding,
        timelineWidth: _config.timelineWidth,
        timelineHeight: _config.timelineHeight,
        barYearWidth: _config.barYearWidth,
        tooltipPadding: 10,
        }
    this.data = _data;
    this.leagueColourScale = _colour;
    this.leagueNameScale = _names;
    this.dispatcher = _dispatcher;
    this.year = '13/14';
    this.league = null;
    this.dataCurrent = this.data.filter(d => d.year == this.year);

    this.initVis();
}

 initVis() {
    let vis = this;

    vis.chartArea = d3.select('#svg').append('g')
      .attr('width', vis.config.containerWidth - vis.config.barYearWidth)
      .attr('height', vis.config.containerHeight - vis.config.timelineHeight)
      .attr('id', 'barTier')
      .attr('transform', `translate(${vis.config.barYearWidth + vis.config.layoutPadding},${vis.config.layoutPadding + vis.config.timelineHeight + 45})`);

    vis.xScale = d3.scaleLinear()
      .range([0, 150]);

    vis.yScale = d3.scaleBand()
      .range([0, 210])
      .paddingInner(0.6)
      .paddingOuter(0.6);

      vis.darkColourScale = d3.scaleOrdinal()
    .domain([2,3,4,5,6,7,8,20, null])
    .range(['#ba4a3d', '#d1822a', '#367a6f', '#1d5278', '#56468c', '#3f6b0d', '#302f30', '#a83974', '#696868']);

    vis.xAxis = d3.axisTop(vis.xScale)
      .ticks(5)
      .tickSize(-210);

    vis.yAxis = d3.axisLeft(vis.yScale);

    vis.xAxisG = vis.chartArea.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', 'translate(130, 35)');

    vis.yAxisG = vis.chartArea.append('g')
      .attr('class', 'axis y-axis')
      .attr('transform', 'translate(130, 35)');

    vis.updateVis();

    }

    updateVis(yearFilter) {
    let vis = this;

    if (yearFilter == null) {
        vis.year = '22/23';
    } else if (yearFilter == 'no change') {
        vis.year = vis.year;
    } else {
        vis.year = yearFilter;
    }

    vis.dataCurrent = this.data.filter(d => d.year == vis.year);

    if(vis.league == null) {
        vis.dataCurrent = d3.rollups(vis.dataCurrent, v => d3.sum(v, v => v.numTeams), d => d.poolName);
        vis.xScale.domain([0, 500]);
    } else {
        vis.dataCurrent = vis.dataCurrent.filter(d => d.activityID == vis.league);
        vis.dataCurrent = d3.rollups(vis.dataCurrent, v => d3.sum(v, v => v.numTeams), d => d.poolName);
        vis.xScale.domain([0, 180]);
    }
    vis.pools = [];

    vis.dataCurrent.forEach(d => vis.pools.push(d[0]));

    vis.yScale.domain(vis.pools);

    // vis.xScale.domain([0, d3.max(vis.dataCurrent, d => d[1]) + 10])

    vis.xAxisG.call(vis.xAxis);
    vis.xAxisG.selectAll('path.domain').remove();

    vis.yAxisG.call(vis.yAxis);
    vis.yAxisG.selectAll('path.domain').remove();

    vis.renderVis();
        
    }

    renderVis() {
    
    let vis = this;

    vis.chartLabel = vis.xAxisG.selectAll('.chartLabel')
      .data([vis.league])
      .join('text')
      .text('Tier Team Registration - ' + vis.leagueNameScale(vis.league))
      .attr('class', 'chartLabel')
      .attr('transform', 'translate(-80, -15)')
      .attr('text-anchor', 'start')
      .style('font-size', 13)
      .style('opacity', 1.0)
      .style('font-weight', 600);

    vis.barTiers = vis.chartArea.selectAll('.barTier')
      .data(vis.dataCurrent)
      .join('rect')
      .attr('class', 'barTier')
      .attr('id', d => d[0].slice(0,3))
      .attr('x', 130)
      .attr('y', d => 35 + vis.yScale(d[0]))
      .attr('height',  vis.yScale.bandwidth)
      .attr('width', d => vis.xScale(d[1]))
      .attr('fill', vis.leagueColourScale(vis.league))
      .on('mouseover', (event, d) => {
        d3.selectAll('#' + d[0].slice(0,3)).style('stroke', vis.darkColourScale(vis.league)).style('stroke-width', 1);
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`
          <div class="tooltip-title">${d[0]}</div>
           <div class="tooltip">${d[1]} teams registered</div>
         `);
      })
      .on('mouseleave', (event, d) => {
        d3.selectAll('#' + d[0].slice(0,3)).style('stroke', 'none');
        d3.select('#tooltip').style('display', 'none');
      });

    }
}