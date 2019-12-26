import _ from "lodash";
import React from "react";

import { COLOURS } from "../../constants/colours.js";
import "./Grid.css";

interface Action {
  actionType: string;
}

interface ClearAction extends Action {
  prevGrid: Array<Array<string>>;
}

interface CellInfo {
  row: number;
  col: number;
  colour: string;
}

interface ColourAction extends Action {
  // Contains differences of previousGrid only
  prevCells: Array<CellInfo>;
}

interface Props {}

interface State {
  grid: Array<Array<string>>;
  history: Array<ColourAction | ClearAction>;
  mouseDown: boolean;
  colour: string;
}

const THROTTLE_TIME = 10; // Time in milliseconds for "mouseEnter" throttle

/* Type Guards */
function isColourAction(
  action: ClearAction | ColourAction
): action is ColourAction {
  return (action as ColourAction).actionType === "colour";
}

function isClearAction(
  action: ClearAction | ColourAction
): action is ClearAction {
  return (action as ClearAction).actionType === "clear";
}

class Grid extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let newGrid = this.createGrid(32);

    this.state = {
      grid: newGrid,
      history: [],
      colour: "#000000",
      mouseDown: false
    };

    // Bind Handlers
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);

    // Bind Throttle handlers
    this.throttledMouseEnter = _.throttle(
      this.throttledMouseEnter.bind(this),
      THROTTLE_TIME
    );
  }

  throttledMouseEnter = (row: number, col: number, e: React.SyntheticEvent) => {
    const { grid, colour, history } = this.state;

    let currColour = grid[row][col];

    /* Don't do anything if nothing happens
     * should never happen as mouseEnter only
     * executes after mouseDown, which adds to history
     * */
    if (!history || history.length === 0) {
      return;
    }

    /* Don't update if no changes were made */
    if (currColour === colour) {
      return;
    }

    let newHistory = history.slice();
    const lastAction = newHistory[newHistory.length - 1];
    let currCellInfo = {
      row: row,
      col: col,
      colour: currColour
    };

    // If last Action was ColourAction, add to prevCells
    if (lastAction && isColourAction(lastAction)) {
      lastAction.prevCells.push(currCellInfo);
    } else {
      let currAction: ColourAction = {
        actionType: "colour",
        prevCells: [currCellInfo]
      };

      newHistory.push(currAction as ColourAction);
    }

    let newGrid = this.updateGrid(grid, row, col, colour);

    this.setState({
      grid: newGrid,
      history: newHistory
    });
  };

  /* Event Handlers */

  handleMouseUp = (e: React.SyntheticEvent) => {
    e.preventDefault();
    this.setState({ mouseDown: false });
  };

  handleMouseDown = (row: number, col: number, e: React.SyntheticEvent) => {
    e.preventDefault();
    const { grid, colour, history } = this.state;

    let currColour = grid[row][col];

    /* Don't update grid if no changes were made */
    if (currColour === colour) {
      this.setState({ mouseDown: true });
      return;
    }

    let newHistory = history.slice();
    let currCellInfo = {
      row: row,
      col: col,
      colour: currColour
    };

    newHistory.push({
      actionType: "colour",
      prevCells: [currCellInfo]
    });

    let newGrid = this.updateGrid(grid, row, col, colour);

    this.setState({
      mouseDown: true,
      history: newHistory,
      grid: newGrid
    });
  };

  handleMouseEnter = (row: number, col: number, e: React.SyntheticEvent) => {
    this.throttledMouseEnter(row, col, e);
  };

  handleMouseLeave = (e: React.SyntheticEvent) => {
    this.setState({ mouseDown: false });
  };

  /* Helper Functions */
  createGrid = (dimension: number) => {
    let grid = [];

    for (let i = 0; i < dimension; i++) {
      let row = [];
      for (let j = 0; j < dimension; j++) {
        row.push("");
      }

      grid.push(row);
    }

    return grid;
  };

  updateGrid = (
    grid: Array<Array<string>>,
    row: number,
    col: number,
    colour: string
  ) => {
    let newGrid = grid.slice().map((curr: Array<string>) => curr.slice());
    newGrid[row][col] = colour;

    return newGrid;
  };

  clearGrid = () => {
    const { grid, history } = this.state;

    let emptyGrid = this.createGrid(32);

    let newState: any = { grid: emptyGrid };

    if (history.length) {
      const prevAction = history[history.length - 1];

      if (!isClearAction(prevAction)) {
        let newHistory = history.slice();

        newHistory.push({
          actionType: "clear",
          prevGrid: grid.slice().map(c => c.slice())
        });

        newState["history"] = newHistory;
      }
    }

    this.setState(newState);
  };

  displayGrid = () => {
    const { grid, mouseDown } = this.state;

    return grid.map((row, rowInd) => {
      let cellArr = row.map((colour, cellInd) => {
        let key = `${rowInd}${cellInd}`;
        let styleObj = {
          border: `thin solid ${COLOURS.cellBorder}`,
          width: "3.125%",
          backgroundColor: colour ? colour : "initial"
        };
        return (
          <div
            style={styleObj}
            key={key}
            onMouseEnter={
              mouseDown
                ? e => this.handleMouseEnter(rowInd, cellInd, e)
                : e => null
            }
            onMouseDown={e => this.handleMouseDown(rowInd, cellInd, e)}
            onMouseUp={e => this.handleMouseUp(e)}
            onTouchMove={
              mouseDown
                ? e => this.handleMouseEnter(rowInd, cellInd, e)
                : e => null
            }
            onTouchStart={e => this.handleMouseDown(rowInd, cellInd, e)}
            onTouchEnd={this.handleMouseUp}
          ></div>
        );
      });

      return (
        <div className="Grid-row" key={"row" + rowInd}>
          {cellArr}
        </div>
      );
    });
  };

  undo = () => {
    const { grid, history } = this.state;

    /* Do nothing if history is empty */
    if (!history || history.length < 1) {
      return;
    }

    let currHistory = history.slice();
    let prevAction = currHistory.pop();

    /* Do nothing if prevAction falsy */
    if (!prevAction) {
      return;
    }

    let newGrid: Array<Array<string>>;

    if (isColourAction(prevAction)) {
      newGrid = grid.slice().map(c => c.slice());
      prevAction.prevCells.forEach(action => {
        let { row, col, colour } = action;
        if (row !== undefined && col !== undefined) {
          newGrid[row][col] = colour ? colour : "";
        }
      });
    } else {
      newGrid = prevAction.prevGrid;
    }

    this.setState({
      grid: newGrid,
      history: currHistory
    });
  };

  render() {
    return (
      <div className="Grid-container">
        <div className="Grid" onMouseLeave={this.handleMouseLeave}>
          {this.displayGrid()}
        </div>
        <div className="button-container">
          <button onClick={this.clearGrid}>Clear</button>
          <button onClick={this.undo}>Undo</button>
        </div>
      </div>
    );
  }
}

export default Grid;
