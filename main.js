d3.csv('data/intramurals.csv').then(data => {
    data.forEach(d => {
     // convert strings to numeric values
      d.numTeams = +d.numTeams;
      d.activityID = +d.activityID;
    });
    

    this.config = {
      containerWidth: 820,
      containerHeight: 570,
      layoutPadding: 10,
      timelineWidth: 800,
      timelineHeight: 250,
      barYearWidth: 500
    };

    this.svg = d3.select("#vis").append('svg')
      .attr('id', 'svg')
      .attr('width', this.config.containerWidth)
      .attr('height', this.config.containerHeight);

    this.leagueColourScale = d3.scaleOrdinal()
      .domain([2,3,4,5,6,7,8,20, null])
      .range(["#fb8072", '#fdb462', '#8dd3c7', '#5793bd', '#8b7dba', '#66a61e', '#636063', '#f781bf', '#cfcecc']);
    this.leagueNameScale = d3.scaleOrdinal()
      .domain([2,3,4,5,6,7,8,20, null])
      .range(['Basketball', 'Futsal', 'Ice Hockey', 'Soccer', 'Ultimate', 'Volleyball', 'Flag Football', 'Dodgeball', 'Leagues Wide']);

    const dispatcher = d3.dispatch('filterBarYear', 'filterTierLeague');

    const timeline = new Timeline(this.config, data, this.leagueColourScale, dispatcher);
    timeline.updateVis(null, []);
    const barTier = new BarTier(this.config, data, this.leagueColourScale, this.leagueNameScale, dispatcher);
    barTier.updateVis(null, []);
    const barYear = new BarYear(this.config, data, this.leagueColourScale, this.leagueNameScale, dispatcher);
    barYear.updateVis(null, []);

    dispatcher.on('filterBarYear', filter => {
      barYear.updateVis(filter[0], filter[1]);
      barTier.league = null;
      barTier.updateVis(filter[0]);
    }).on('filterTierLeague', filter => {
      barTier.league = filter;
      barTier.updateVis('no change');
    });

  });