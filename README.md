# javascript-astar

## An A* Search Algorithm implementation in JavaScript, adapted for traversing Hex grids

This is a fork of https://github.com/bgrins/javascript-astar

The Hex grid coordinate system is assumed to follow http://www.redblobgames.com/grids/hexagons/#coordinates , i.e. x points to northeast, y to northwest, z to south with ``x + y + z = 0``.

## Sample Usage

```html
  <script type='text/javascript' src='graph.js'></script>
  <script type='text/javascript' src='astar.js'></script>
  <script type='text/javascript'>
    var tiles = [];
    tiles.push({
      x: 0,
      y: 0
      // ...
    });
    tiles.push({
      x: 1,
      y: -1
      // ...
    });
    // ...
    var mapSize = {
      width: 2,
      height: 1
    };

    var graph = new Graph(tiles,
      function(tile) { return tile.x; },
      function(tile) { return tile.y; },
      function(tile) { return GraphNodeType.OPEN; }, // traversable or wall
      function(tile) { return 1; }, // node cost
      mapSize
    );
    var start = graph.getNode(0, 0);
    var end = graph.getNode(1, -1);
    var result = astar.search(graph, start, end);
    // result is an array containing the tiles to traverse in order to get from start to end with the lowest cost; empty array if no path could be found
  </script>
```

## History

This library is based on the work of

* https://github.com/bgrins/javascript-astar
* Binary Heap (with modifications) from Marijn Haverbeke http://eloquentjavascript.net/appendix2.html

