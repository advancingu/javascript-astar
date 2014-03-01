/**
 * This file is part of the javascript-astar library.
 * javascript-astar is freely distributable under the MIT License.
 * See LICENSE for details.
 */

var astar = {
    /**
     * @param array GraphNodes
     */
    init: function(nodes) {
        for(var i = 0, len = nodes.length; i < len; i++) {
            var node = nodes[i];
            node.f = 0;
            node.g = 0;
            node.h = 0;
            node.visited = false;
            node.closed = false;
            node.parent = null;
        }
    },
    heap: function() {
        return new BinaryHeap(function(node) {
            return node.f;
        });
    },
    /**
     * @param graph Graph
     * @param start GraphNode
     * @param end GraphNode
     * @param heuristic undefined|function(graph, pos0, pos1)
     * @return array Node objects graph was created from, ordered
     * from first step after start node to (including) end node.
     */
    search: function(graph, start, end, heuristic) {
        astar.init(graph.nodes);
        heuristic = heuristic || astar.distance;

        var openHeap = astar.heap();

        openHeap.push(start);

        while(openHeap.size() > 0) {

            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();

            // End case -- result has been found, return the caller's original objects in the order to traverse.
            if(currentNode === end) {
                var curr = currentNode;
                var ret = [];
                while(curr.parent) {
                    ret.push(curr.data); // return caller's objects, not temporary graph nodes
                    curr = curr.parent;
                }
                return ret.reverse();
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;

            // Get all neighbors for the current node.
            var neighbors = astar.neighbors(currentNode);

            for(var i=0, il = neighbors.length; i < il; i++) {
                var neighbor = neighbors[i];

                if(neighbor.closed || neighbor.isWall()) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }

                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentNode.g + neighbor.cost;
                var beenVisited = neighbor.visited;

                if(!beenVisited || gScore < neighbor.g) {

                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic(graph, neighbor.pos, end.pos);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                    }
                    else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }

        // No result was found - empty array signifies failure to find path.
        return [];
    },
    distance: function(graph, pos0, pos1) {
        // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

        return graph.getDistanceDirect(pos0, pos1);
    },
    neighbors: function(node) {
        return node.neighbors;
    }
};
