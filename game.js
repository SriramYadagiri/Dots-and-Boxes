class Board {
    constructor(cols, rows) {
        this.player = 1;
        this.scores = [0, 0];
        this.cols = cols;
        this.rows = rows;
        this.boxSize = height / rows;
        this.vertices = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.vertices.push(new Vertex(x, y, this.boxSize, this.boxSize / 5));
            }
        }

        this.edges = [];
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                const vertex = this.getVertex(x, y);
                if (x < cols - 1) {
                    let newVert = this.getVertex(x + 1, y);
                    this.edges.push(new Edge(vertex, newVert, 'horizontal'));
                }
                if (y < rows - 1) {
                    let newVert = this.getVertex(x, y + 1);
                    this.edges.push(new Edge(vertex, newVert, 'vertical'));
                }
            }
        }

        this.boxes = [];

        this.player = 1;
    }

    updateScores(player) {
        this.scores[player - 1]++;
        document.getElementById('score' + player).innerText = this.scores[player - 1];
        if (this.boxes.length >= (this.cols-1) * (this.rows-1)) {
            const winner = this.scores[0] > this.scores[1] ? 1 : (this.scores[0] < this.scores[1] ? 2 : 0);
            if (winner) {
                alert(`Player ${winner} wins!`);
            } else {
                alert("It's a draw!");
            }
        }
    }

    setPlayer(p) {
        this.player = p;
        const el = document.getElementById('current-player');

        el.classList.remove('player-blue', 'player-red');
        el.classList.add(this.player === 1 ? 'player-blue' : 'player-red');

        el.textContent = this.player;
        let className = `flash-${this.player == 1 ? 'blue' : 'red'}`;
        el.classList.add(className);
        setTimeout(() => el.classList.remove(className), 600);
    }

    getVertex(col, row) {
        return this.vertices[row * this.cols + col];
    }

    resetSelector() {
        if (this.selector.startVertex) {
            this.selector.startVertex.selected = false;
        }
        this.selector.startVertex = null;
        this.selector.endVertex = null;
    }

    getEdge(topLeft, direction) {
        // let col = topLeft.x;
        // let row = topLeft.y;
    
        // if (direction == "horizontal") {
        //     let ind = col*this.rows + row;
        //     return this.edges[ind*2]
        // }
        // else if (direction == "vertical") {
        //     let ind = col*(this.rows-1) + row;
        //     return this.edges[ind*2 + 1];
        // }
        // console.error("Invalid direction: " + direction);
        // return null;
        const edge = this.edges.find(e => e.direction == direction && e.vertices[0] === topLeft);
        if (edge) {
            return edge;
        } else {
            console.error("Edge not found for vertex:", topLeft, "in direction:", direction);
            return null;
        }
    }

    checkForCompletedSquare(lastEdge) {
        let completedSquare = false;
        let col = lastEdge.vertices[0].x;
        let row = lastEdge.vertices[0].y;
        const direction = lastEdge.direction;

        if (direction === 'horizontal') {
            if (row > 0) {
                let topLeft = this.getVertex(col, row - 1);
                let topRight = this.getVertex(col + 1, row - 1);
                let bottomLeft = lastEdge.vertices[0];
                let bottomRight = lastEdge.vertices[1];

                let edges = [this.getEdge(topLeft, 'horizontal'),
                             this.getEdge(topLeft, 'vertical'),
                             this.getEdge(topRight, 'vertical'),];

                if (edges.every(e => e.player !== 0)) {
                    const box = new Box([topLeft, topRight, bottomRight, bottomLeft]);
                    box.owner = this.player;
                    this.boxes.push(box);
                    this.updateScores(this.player);
                    completedSquare = true;
                }
            }

            if (row < this.rows - 1) {
                let topLeft = lastEdge.vertices[0];
                let topRight = lastEdge.vertices[1];
                let bottomLeft = this.getVertex(col, row + 1);
                let bottomRight = this.getVertex(col + 1, row + 1);

                let edges = [this.getEdge(bottomLeft, 'horizontal'),
                             this.getEdge(topLeft, 'vertical'),
                             this.getEdge(topRight, 'vertical'),];

                if (edges.every(e => e.player !== 0)) {
                    const box = new Box([topLeft, topRight, bottomRight, bottomLeft]);
                    box.owner = this.player;
                    this.boxes.push(box);
                    this.updateScores(this.player);
                    completedSquare = true;
                }
            }
        }

        if (direction === 'vertical') {
            if (col > 0) {
                let topLeft = this.getVertex(col-1, row);
                let topRight = lastEdge.vertices[0];
                let bottomLeft = this.getVertex(col-1, row+1);
                let bottomRight = lastEdge.vertices[1];

                let edges = [this.getEdge(topLeft, 'horizontal'),
                             this.getEdge(topLeft, 'vertical'),
                             this.getEdge(bottomLeft, 'horizontal'),];

                if (edges.every(e => e.player !== 0)) {
                    const box = new Box([topLeft, topRight, bottomRight, bottomLeft]);
                    box.owner = this.player;
                    this.boxes.push(box);
                    this.updateScores(this.player);
                    completedSquare = true;
                }
            }

            if (col < this.cols - 1) {
                let topLeft = lastEdge.vertices[0];
                let topRight = this.getVertex(col + 1, row);
                let bottomLeft = lastEdge.vertices[1];
                let bottomRight = this.getVertex(col + 1, row + 1);

                let edges = [this.getEdge(topLeft, 'horizontal'),
                             this.getEdge(topRight, 'vertical'),
                             this.getEdge(bottomLeft, 'horizontal'),];

                if (edges.every(e => e.player !== 0)) {
                    const box = new Box([topLeft, topRight, bottomRight, bottomLeft]);
                    box.owner = this.player;
                    this.boxes.push(box);
                    this.updateScores(this.player);
                    completedSquare = true;
                }
            }
        }

        if (!completedSquare) this.setPlayer(this.player === 1 ? 2 : 1);
    }

    selectEdge(edge) {
        if (edge && edge.player === 0) {
            edge.player = this.player;
            this.checkForCompletedSquare(edge);
        }
    }

    detectHoveredEdge(mx, my) {
        this.hoveredEdge = null;
        const tolerance = this.boxSize / 4; // Adjust tolerance as needed

        for (let edge of this.edges) {
            if (edge.player !== 0) continue;
            if (edge.isNear(mx, my, tolerance)) {
                this.hoveredEdge = edge;
                break;
            }
        }
    }

    draw() {
        for (const box of this.boxes) box.draw();
        for (const edge of this.edges) edge.draw(edge === this.hoveredEdge);
        for (const vertex of this.vertices) vertex.draw();
    }
}

class Vertex {
    constructor(x, y, boxSize, radius = 6) {
        this.x = x;
        this.y = y;
        this.position = { x: x * boxSize + boxSize/2, y: y * boxSize + boxSize/2 };
        this.radius = radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'steelblue';
        ctx.fill();
    }
}

class Edge {
    constructor(startVertex, endVertex, dir) {
        this.vertices = [startVertex, endVertex];
        this.startPos = startVertex.position;
        this.endPos = endVertex.position;
        this.player = 0;
        this.direction = dir;
        this.size = dist(this.startPos, this.endPos);
    }

    isNear(mx, my, tolerance) {
        const x1 = this.startPos.x, y1 = this.startPos.y;
        const x2 = this.endPos.x, y2 = this.endPos.y;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSq = dx * dx + dy * dy;
        const t = ((mx - x1) * dx + (my - y1) * dy) / lengthSq;
        if (t < 0 || t > 1) return false;
        const px = x1 + t * dx;
        const py = y1 + t * dy;
        const distSq = (mx - px) ** 2 + (my - py) ** 2;
        return distSq <= tolerance * tolerance;
    }

    draw(isHovered = false) {
        ctx.beginPath();
        ctx.moveTo(this.startPos.x, this.startPos.y);
        ctx.lineTo(this.endPos.x, this.endPos.y);
        if (this.player !== 0) {
            ctx.strokeStyle = this.player === 1 ? 'skyblue' : 'salmon';
            ctx.lineWidth = this.size / 5;
        } else if (isHovered) {
            ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
            ctx.lineWidth = this.size / 5-2;
        } else {
            return;
        }
        ctx.stroke();
    }
}

class Box {
    constructor(vertices) {
        this.vertices = vertices; // Array of 4 Vertex objects
        this.owner = null; // Player who owns the box
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].position.x, this.vertices[0].position.y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].position.x, this.vertices[i].position.y);
        }
        ctx.closePath();
        ctx.fillStyle = this.owner === 1 ? 'rgba(135, 206, 235, 0.5)' : 'rgba(250, 128, 114, 0.5)';
        ctx.fill();
    }
}

function dist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}