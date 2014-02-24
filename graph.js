/**
 * This file is part of the javascript-astar library.
 * javascript-astar is freely distributable under the MIT License.
 * See LICENSE for details.
 */


var GraphNodeType = {
    OPEN: 1,
    WALL: 0
};

/**
 * Creates a Graph class used in the astar search algorithm.
 * @param grid Array of hex tile objects.
 * @param xFunc Function that returns a tile's x coordinate.
 * @param yFunc Function that returns a tile's y coordinate.
 * @param typeFunc Function that returns a tile's GraphNodeType.
 * @param costFunc Function that returns a tile's cost.
 * @param mapSize Object{ width: int, height: int }
 */
function Graph(tiles, xFunc, yFunc, typeFunc, costFunc, mapSize) {
    var nodes = [];

    for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        nodes[i] = new GraphNode(xFunc(tile), yFunc(tile), typeFunc(tile), costFunc(tile));
        nodes[i].data = tile; // keep reference to caller's tile object
    }

    this.input = tiles;
    this.nodes = nodes;
    this.mapSize = mapSize;
}

Graph.prototype.toString = function() {
    var graphString = "\n";
    var nodes = this.nodes;
    for (var i = 0, len = nodes.length; i < len; i++) {
        graphString = graphString + nodes[i].toString() + " ";
    }
    return graphString;
};

/**
 * @return True, if the tile with coordinates x, y
 * is in the valid map area, false otherwise.
 */
Graph.prototype.isOnMap = function(x, y) {
    var mapSize = this.mapSize;
    return (
                /** (-x - y) == z due to x + y + z == 0 */
                (-x - y) >= 0 // top of map
                && (-x - y) < mapSize.height // bottom of map
                && x >= y // left of map; for each step to top left (y), go at least equal to top right (x)
                && Math.ceil((x - y) / 2) < mapSize.width // right of map; the sum of x and y steps must be less than map width
                );
}

/**
 * @return The GraphNode object with coordinates x,y or null
 * if no node at such coordinates.
 */
Graph.prototype.getNode = function(x, y) {
    if (!this.isOnMap(x, y)) {
        return null;
    }

    var tileIndex = this.index(x, y);
    var node = this.nodes[tileIndex];
    if (node) {
        return node;
    } else {
        return null;
    }
}

/**
 * @return Array index number of tile with coordinates x, y.
 */
Graph.prototype.index = function(x, y) {
    return this.mapSize.width * (-x - y) + x; // mapWidth * z + x // with x + y + z == 0
}

/**
 * Calculate the distance between two map points.
 * @param posStart Point object {x: int, y: int, z: int}
 * @param posEnd Point object {x: int, y: int, z: int}
 */
Graph.prototype.getDistanceDirect = function(posStart, posEnd) {
    return (Math.abs(posStart.x - posEnd.x)
            + Math.abs(posStart.y - posEnd.y)
            + Math.abs(posStart.z - posEnd.z))
            / 2;
}


function GraphNode(x,y,type,cost) {
    this.data = { };
    this.x = x;
    this.y = y;
    this.pos = {
        x: x,
        y: y,
        z: -x - y // x + y + z == 0
    };
    this.type = type;
    this.cost = cost;
}

GraphNode.prototype.toString = function() {
    return "[" + this.x + " " + this.y + "]";
};

GraphNode.prototype.isWall = function() {
    return this.type == GraphNodeType.WALL;
};


function BinaryHeap(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
    push: function(element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    },
    pop: function() {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
             this.content[0] = end;
             this.bubbleUp(0);
        }
        return result;
    },
    remove: function(node) {
        var i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            }
            else {
                this.bubbleUp(i);
            }
        }
    },
    size: function() {
        return this.content.length;
    },
    rescoreElement: function(node) {
        this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1,
                parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }

            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    },
    bubbleUp: function(n) {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);

        while(true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1, child1N = child2N - 1;
            // This is used to store the new position of the element,
            // if any.
            var swap = null;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
            // Look it up and compute its score.
            var child1 = this.content[child1N],
                child1Score = this.scoreFunction(child1);

            // If the score is less than our element's, we need to swap.
            if (child1Score < elemScore)
                swap = child1N;
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }

            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
};
