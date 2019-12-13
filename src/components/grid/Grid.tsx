import _ from "lodash";
import React from "react";

import { COLOURS } from "../../constants/colours.js";
import "./Grid.css";

interface Props {}

interface State {
  grid: Array<Array<string>>;
  mouseDown: boolean;
  colour: string;
}

const THROTTLE_TIME = 10; // Time in milliseconds for "mouseEnter" throttle

class Grid extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let newGrid = this.createGrid(32);

    this.state = {
      grid: newGrid,
      colour: "#000000",
      mouseDown: false
    };

    // Bind Handlers
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);

    // Bind Throttle handlers
    this.throttledMouseEnter = _.throttle(
      this.throttledMouseEnter.bind(this),
      THROTTLE_TIME
    );
  }

  throttledMouseEnter = (row: number, col: number, e: React.SyntheticEvent) => {
    e.preventDefault();
    const { grid, colour } = this.state;
    this.setState({ grid: this.updateGrid(grid, row, col, colour) });
  };

  /* Event Handlers */

  handleMouseUp = (e: React.SyntheticEvent) => {
    e.preventDefault();

    this.setState({ mouseDown: false });
  };

  handleMouseDown = (row: number, col: number, e: React.SyntheticEvent) => {
    e.preventDefault();
    const { grid, colour } = this.state;

    this.setState({
      mouseDown: true,
      grid: this.updateGrid(grid, row, col, colour)
    });
  };

  handleMouseEnter = (row: number, col: number, e: React.SyntheticEvent) => {
    this.throttledMouseEnter(row, col, e);
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
    this.setState({ grid: this.createGrid(32) });
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
            onMouseUp={this.handleMouseUp}
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

  render() {
    return (
      <div className="Grid-container">
        <div className="Grid">{this.displayGrid()}</div>
        <div className="button-container">
          <button onClick={this.clearGrid}>Clear</button>
        </div>
      </div>
    );
  }
}

export default Grid;
