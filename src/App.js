import React, { useState, useEffect } from 'react';

function Square({ value, onSquareClick, highlight }) {
  return (
    <button className={`square ${highlight ? "highlight" : ''}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, winningSquares, onPlay, endGame}) {
  function handleClick(i) {
    if (calculateWinner(squares).length > 0 || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  let status;
  const [winner, winningLines] = calculateWinner(squares);
  if (winner) {
    status = 'Winner: ' + winner;
    //endGame(winner, winningLines); // X. 렌더링 도중 부모 state 변경! => useEffect() 내부로 이동
  } else if (squares.every(el => el != null)) {
    // 아무도 승리하지 않으면 무승부라는 메시지를 표시
    status = "무승부";    
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }
  
  // 렌더링 이후 승자 발생 시 endGame 호출
  useEffect(() => {
    if (winner && winningLines) {
      endGame(winner, winningLines);
    }
  }, [winner, winningLines, endGame]);
  
  // Board를 하드 코딩 하는 대신 두 개의 루프를 사용하여 사각형을 만들도록 다시 작성
  function render() {
    let elements = [];
    
    elements.push(React.createElement('div', {key: 'status', className: 'status'}, status));

    for (let i=0; i<3; i++) {
      let childrens = [];

      for (let j=0; j<3; j++) {
        let index = 3*i + j;
        let highlight =  !!winningSquares[index];
        childrens.push(React.createElement(Square, {key: index, value: squares[index], onSquareClick: () => handleClick(index), highlight }));
      }

      elements.push(React.createElement('div', {key: `board-row-${i}`, className: 'board-row'}, childrens));
    }

    return elements;
  }
  
  return render();
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [winningSquares, setWinningSquares] = useState(Array(9).fill(null));
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    // 현재 이동에 대해서만 버튼 대신 “당신은 #번째 순서에 있습니다…”를 표시
    if (move == currentMove) {
      return (
        <li key={move}>
          <p>“당신은 {move}번째 순서에 있습니다…</p>
        </li>
      );
    }
    
    // 현재 이동이 아닌 경우 버튼 표시
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    // 이동은 중간에 순서를 바꾸거나 삭제하거나 삽입할 수 없으므로 이동 인덱스를 key로 사용하는 것이 안전
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  // 동작을 오름차순 또는 내림차순으로 정렬할 수 있는 토글 버튼을 추가
  const [isInfoAsc, setIsInfoAsc] = useState(true);
  function toggleInfoSort() {
    setIsInfoAsc(!isInfoAsc);
  }

  // 누군가 승리하면 승리의 원인이 된 세 개의 사각형을 강조 표시
  function endGame(winner, winningLines) {
    if (!winningSquares.every(el => el === null)) return;

    const winning = [...winningSquares];
    winningLines.map((i) => {
      winning[i] = true;
    })

    setWinningSquares(winning);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} winningSquares={winningSquares} onPlay={handlePlay} endGame={endGame}/>
      </div>
      <div className="game-info">
        <button onClick={toggleInfoSort}>{isInfoAsc ? '↑' : '↓'}</button>
        <ol>{isInfoAsc ? moves : moves.reverse()}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]];
    }
  }
  return [];
}