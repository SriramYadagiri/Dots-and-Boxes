function playBotMove() {
    const availableEdges = board.edges.filter(e => e.player === 0);
    let scoringMoves = [];

    for (let edge of availableEdges) {
        // Temporarily mark edge
        edge.player = 2;
        const preBoxes = board.boxes.length;

        // Simulate check for square
        board.checkForCompletedSquare(edge);

        // See if square was completed
        const postBoxes = board.boxes.length;

        // Undo the move
        edge.player = 0;
        board.boxes.splice(preBoxes); // Remove fake box(es)
        board.setPlayer(2); // Reset player back

        if (postBoxes > preBoxes) {
            scoringMoves.push(edge);
        }
    }

    const bestEdge = scoringMoves.length > 0
        ? scoringMoves[Math.floor(Math.random() * scoringMoves.length)]
        : availableEdges[Math.floor(Math.random() * availableEdges.length)];

    board.selectEdge(bestEdge);
    if (board.player == 2) {
        setTimeout(playBotMove, 300);
    }
}